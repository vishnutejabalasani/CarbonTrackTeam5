package com.carbontrack.service;

import com.carbontrack.dto.LogActivityRequest;
import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.EmissionFactor;
import com.carbontrack.entity.User;
import com.carbontrack.entity.Goal;
import com.carbontrack.repository.ActivityRepository;
import com.carbontrack.repository.EmissionFactorRepository;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.repository.GoalRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final EmissionFactorRepository emissionFactorRepository;
    private final GoalRepository goalRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ActivityService(ActivityRepository activityRepository, 
                           UserRepository userRepository,
                           EmissionFactorRepository emissionFactorRepository,
                           GoalRepository goalRepository,
                           ApplicationEventPublisher eventPublisher) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.emissionFactorRepository = emissionFactorRepository;
        this.goalRepository = goalRepository;
        this.eventPublisher = eventPublisher;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @CacheEvict(value = {"weeklySummary", "aggregationByCategory", "aggregationByDate", "peerBenchmarking", "organizationDashboard"}, allEntries = true)
    public ActivityLog logActivity(LogActivityRequest request) {
        User user = getAuthenticatedUser();

        // Retrieve configured emission factor from the database
        EmissionFactor factor = emissionFactorRepository.findByActivityTypeAndIsActiveTrue(request.getActivityType())
                .orElseThrow(() -> new IllegalArgumentException("Unknown or inactive activity type: " + request.getActivityType()));

        // Validate category
        if (!factor.getCategory().equalsIgnoreCase(request.getCategory())) {
            throw new IllegalArgumentException("Activity type " + request.getActivityType() + 
                    " belongs to category " + factor.getCategory() + ", not " + request.getCategory());
        }

        // Validate unit
        if (!factor.getUnit().equalsIgnoreCase(request.getUnit())) {
            throw new IllegalArgumentException("Invalid unit: " + request.getUnit() + 
                    ". Expected unit: " + factor.getUnit());
        }

        Double calculatedCO2e = request.getQuantity() * factor.getEmissionValueKgCO2e();

        ActivityLog activity = ActivityLog.builder()
                .user(user)
                .category(factor.getCategory())
                .activityType(factor.getActivityType())
                .quantity(request.getQuantity())
                .unit(factor.getUnit())
                .logDate(request.getLogDate())
                .calculatedEmissionsKgCO2e(calculatedCO2e)
                .build();

        ActivityLog saved = activityRepository.save(activity);

        // Publish event to trigger decoupled badge calculations
        eventPublisher.publishEvent(new com.carbontrack.event.ActivityLoggedEvent(this, user));

        return saved;
    }

    public List<ActivityLog> getRecentActivities(int limit) {
        User user = getAuthenticatedUser();

        return activityRepository.findByUserOrderByLogDateDesc(user).stream()
                .limit(limit)
                .toList();
    }

    public Double getEmissionFactor(String activityType) {
        return emissionFactorRepository.findByActivityTypeAndIsActiveTrue(activityType)
                .map(EmissionFactor::getEmissionValueKgCO2e)
                .orElse(0.0);
    }

    public Map<String, Object> getFilteredActivities(
            String category, LocalDate startDate, LocalDate endDate,
            String sortBy, String sortOrder, int page, int pageSize) {
        User user = getAuthenticatedUser();

        String sortProperty = "logDate";
        if ("emissions".equalsIgnoreCase(sortBy)) {
            sortProperty = "calculatedEmissionsKgCO2e";
        } else if ("category".equalsIgnoreCase(sortBy)) {
            sortProperty = "category";
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(direction, sortProperty));

        Page<ActivityLog> resultPage = activityRepository.findFiltered(user, category, startDate, endDate, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("activities", resultPage.getContent());
        response.put("total", resultPage.getTotalElements());
        return response;
    }

    private double calculateWeeklyBaseline(User user, LocalDate goalStartDate) {
        LocalDate startOfBaseline = goalStartDate.minusDays(7);
        List<ActivityLog> baselineActivities = activityRepository.findByUserOrderByLogDateDesc(user).stream()
                .filter(a -> a.getLogDate().isAfter(startOfBaseline.minusDays(1)) && a.getLogDate().isBefore(goalStartDate))
                .toList();
        double baselineSum = baselineActivities.stream()
                .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                .sum();
        return baselineSum > 0 ? baselineSum : 200.0;
    }

    // Returns the shape the dashboard UI expects: total + per-category
    // breakdown + a weekly target.
    @Cacheable("weeklySummary")
    public Map<String, Object> getWeeklySummary() {
        User user = getAuthenticatedUser();
        LocalDate weekAgo = LocalDate.now().minusDays(7);

        List<ActivityLog> activities = activityRepository.findByUserOrderByLogDateDesc(user).stream()
                .filter(a -> a.getLogDate().isAfter(weekAgo) || a.getLogDate().isEqual(weekAgo))
                .toList();

        double total = sumEmissions(activities, null);
        double transport = sumEmissions(activities, "transport");
        double electricity = sumEmissions(activities, "electricity");
        double food = sumEmissions(activities, "food");
        double shopping = sumEmissions(activities, "shopping");

        // Calculate Target from Active Goal
        double weeklyTargetKg = 200.0;
        List<Goal> activeGoals = goalRepository.findByUserAndStatus(user, "active");
        if (!activeGoals.isEmpty()) {
            Goal activeGoal = activeGoals.get(0);
            double baseline = calculateWeeklyBaseline(user, activeGoal.getStartDate());
            weeklyTargetKg = baseline * (1.0 - (activeGoal.getTargetReductionPercentage() / 100.0));
        }

        // Calculate week-over-week percent change
        LocalDate twoWeeksAgo = LocalDate.now().minusDays(14);
        List<ActivityLog> lastWeekActivities = activityRepository.findByUserOrderByLogDateDesc(user).stream()
                .filter(a -> a.getLogDate().isAfter(twoWeeksAgo.minusDays(1)) && a.getLogDate().isBefore(weekAgo))
                .toList();
        double lastWeekTotal = sumEmissions(lastWeekActivities, null);
        double percentChange = 0.0;
        if (lastWeekTotal > 0) {
            percentChange = ((total - lastWeekTotal) / lastWeekTotal) * 100.0;
        }

        // Generate smart recommendations based on top 3 highest-emission activities
        List<Map<String, String>> recommendations = getPersonalizedRecommendations(user);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalKgCo2e", round1(total));
        summary.put("weeklyTargetKg", round1(weeklyTargetKg));
        summary.put("percentChangeVsLastWeek", round1(percentChange));
        summary.put("transportKg", round1(transport));
        summary.put("electricityKg", round1(electricity));
        summary.put("foodKg", round1(food));
        summary.put("shoppingKg", round1(shopping));
        summary.put("recommendations", recommendations);
        return summary;
    }

    public List<Map<String, String>> getPersonalizedRecommendations(User user) {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        
        List<ActivityLog> logs = activityRepository.findByUserOrderByLogDateDesc(user).stream()
                .filter(a -> a.getLogDate().isAfter(thirtyDaysAgo.minusDays(1)))
                .toList();
        
        Map<String, Double> emissionsByActivity = new HashMap<>();
        for (ActivityLog log : logs) {
            emissionsByActivity.put(
                log.getActivityType(),
                emissionsByActivity.getOrDefault(log.getActivityType(), 0.0) + (log.getCalculatedEmissionsKgCO2e() != null ? log.getCalculatedEmissionsKgCO2e() : 0.0)
            );
        }
        
        List<Map.Entry<String, Double>> topActivities = emissionsByActivity.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(3)
                .toList();
        
        List<Map<String, String>> recommendations = new ArrayList<>();
        
        for (Map.Entry<String, Double> entry : topActivities) {
            String activityType = entry.getKey();
            Double emissions = entry.getValue();
            if (emissions <= 0.0) continue;
            
            Map<String, String> rec = getTipForActivity(activityType, emissions);
            if (rec != null) {
                recommendations.add(rec);
            }
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add(Map.of(
                "title", "Set a Carbon Goal",
                "desc", "Keep your emissions low! Try setting a new carbon reduction goal to challenge yourself further."
            ));
            recommendations.add(Map.of(
                "title", "Log Daily Activities",
                "desc", "Consistency is key. Track transport, diet, and utility usage to unlock personalized insights."
            ));
        }
        
        return recommendations;
    }

    private Map<String, String> getTipForActivity(String activityType, double emissions) {
        String rounded = String.format("%.1f", emissions);
        if (activityType.startsWith("car_km")) {
            return Map.of(
                "title", "Reduce Car Travel",
                "desc", "Your car transit contributed " + rounded + " kg CO2e. Try carpooling, biking, or public transit to cut this in half."
            );
        } else if (activityType.startsWith("flight")) {
            return Map.of(
                "title", "Offset Flight Emissions",
                "desc", "Flights contributed a significant " + rounded + " kg CO2e. Consider trains for shorter distances or offsetting emissions."
            );
        } else if (activityType.startsWith("kwh_coal") || activityType.startsWith("kwh_natural_gas") || activityType.equals("kwh_grid_avg")) {
            return Map.of(
                "title", "Optimize Home Power",
                "desc", "Grid electricity output is " + rounded + " kg CO2e. Switch off standby appliances and replace bulbs with LED alternatives."
            );
        } else if (activityType.equals("meal_beef") || activityType.equals("meal_chicken")) {
            return Map.of(
                "title", "Shift to Plant-Based Meals",
                "desc", "Meat-heavy meals contributed " + rounded + " kg CO2e. Try having a few Vegetarian/Vegan days to lower your footprint."
            );
        } else if (activityType.contains("purchase") || activityType.equals("household_goods")) {
            return Map.of(
                "title", "Sustainable Shopping",
                "desc", "Retail purchases caused " + rounded + " kg CO2e. Consider buying secondhand, choosing durable goods, or repairing instead of buying new."
            );
        }
        return null;
    }

    @Cacheable("aggregationByCategory")
    public List<Map<String, Object>> getEmissionsByCategory(LocalDate startDate, LocalDate endDate) {
        User user = getAuthenticatedUser();
        List<Object[]> results = activityRepository.aggregateEmissionsByCategory(user, startDate, endDate);
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : results) {
            list.add(Map.of(
                "category", row[0],
                "emissions", round1((Double) row[1])
            ));
        }
        return list;
    }

    @Cacheable("aggregationByDate")
    public List<Map<String, Object>> getEmissionsByDate(LocalDate startDate, LocalDate endDate) {
        User user = getAuthenticatedUser();
        List<Object[]> results = activityRepository.aggregateEmissionsByDate(user, startDate, endDate);
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : results) {
            list.add(Map.of(
                "date", row[0].toString(),
                "emissions", round1((Double) row[1])
            ));
        }
        return list;
    }

    @Cacheable("peerBenchmarking")
    public Map<String, Object> getPeerBenchmarking() {
        User user = getAuthenticatedUser();
        long totalUsers = userRepository.count();
        if (totalUsers == 0) totalUsers = 1;
        
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        
        Map<String, Double> categoryAverages = new HashMap<>();
        List<String> categories = List.of("transport", "electricity", "food", "shopping");
        
        for (String cat : categories) {
            Double platformTotal = activityRepository.sumEmissionsByCategoryAndDateRange(cat, thirtyDaysAgo, LocalDate.now());
            if (platformTotal == null) platformTotal = 0.0;
            categoryAverages.put(cat, round1(platformTotal / totalUsers));
        }
        
        Map<String, Double> userEmissions = new HashMap<>();
        for (String cat : categories) {
            Double userTotal = activityRepository.sumEmissionsByUserAndCategoryAndDateRange(user, cat, thirtyDaysAgo, LocalDate.now());
            if (userTotal == null) userTotal = 0.0;
            userEmissions.put(cat, round1(userTotal));
        }
        
        List<Object[]> userTotalsList = activityRepository.sumAllUsersEmissionsInDateRange(thirtyDaysAgo, LocalDate.now());
        double userTotalEmissions = userEmissions.values().stream().mapToDouble(Double::doubleValue).sum();
        
        long usersWithLowerEmissions = 0;
        long totalActiveUsers = userTotalsList.size();
        
        for (Object[] row : userTotalsList) {
            Double totalEm = (Double) row[1];
            if (totalEm < userTotalEmissions) {
                usersWithLowerEmissions++;
            }
        }
        
        double percentile = totalActiveUsers > 0 
            ? ((double) usersWithLowerEmissions / totalActiveUsers) * 100.0 
            : 100.0;
        
        Map<String, Object> benchmark = new HashMap<>();
        benchmark.put("categoryAverages", categoryAverages);
        benchmark.put("userCategoryEmissions", userEmissions);
        benchmark.put("percentile", round1(percentile));
        benchmark.put("totalUsers", totalUsers);
        
        return benchmark;
    }

    @Cacheable("organizationDashboard")
    public Map<String, Object> getOrganizationDashboard() {
        LocalDate start = LocalDate.now().minusDays(30);
        long totalEmployees = userRepository.count();
        if (totalEmployees == 0) totalEmployees = 1;
        
        List<Object[]> categorySums = activityRepository.sumAllCategoriesEmissionsInDateRange(start, LocalDate.now());
        Map<String, Double> categoryTotals = new HashMap<>();
        double grandTotal = 0.0;
        
        for (Object[] row : categorySums) {
            String category = (String) row[0];
            Double sum = (Double) row[1];
            if (sum == null) sum = 0.0;
            categoryTotals.put(category, round1(sum));
            grandTotal += sum;
        }
        
        Map<String, Object> orgDashboard = new HashMap<>();
        orgDashboard.put("totalEmployees", totalEmployees);
        orgDashboard.put("totalEmissionsKgCO2e", round1(grandTotal));
        orgDashboard.put("averageEmissionsPerEmployee", round1(grandTotal / totalEmployees));
        orgDashboard.put("categoryTotals", categoryTotals);
        
        List<Map<String, Object>> weeklyTrends = new ArrayList<>();
        for (int i = 3; i >= 0; i--) {
            LocalDate wStart = LocalDate.now().minusDays((i + 1) * 7);
            LocalDate wEnd = LocalDate.now().minusDays(i * 7);
            Double weekTotal = activityRepository.sumEmissionsInDateRange(wStart, wEnd);
            if (weekTotal == null) weekTotal = 0.0;
            
            weeklyTrends.add(Map.of(
                "week", "Week -" + i,
                "emissions", round1(weekTotal)
            ));
        }
        orgDashboard.put("weeklyTrends", weeklyTrends);
        
        return orgDashboard;
    }

    private double sumEmissions(List<ActivityLog> activities, String categoryFilter) {
        return activities.stream()
                .filter(a -> categoryFilter == null || categoryFilter.equalsIgnoreCase(a.getCategory()))
                .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                .sum();
    }

    private double round1(double value) {
        return Math.round(value * 10) / 10.0;
    }
}
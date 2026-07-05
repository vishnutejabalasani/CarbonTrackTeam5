package com.carbontrack.service;

import com.carbontrack.dto.LogActivityRequest;
import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityRepository;
import com.carbontrack.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    // Emission factors (kg CO2e per unit)
    private static final Map<String, Double> EMISSION_FACTORS = new HashMap<>();

    static {
        // Transport
        EMISSION_FACTORS.put("car_km", 0.192);
        EMISSION_FACTORS.put("flight_hours", 90.0);
        EMISSION_FACTORS.put("public_transit", 0.041);
        EMISSION_FACTORS.put("Car km (Petrol)", 0.192);
        EMISSION_FACTORS.put("Car km (Diesel)", 0.171);
        EMISSION_FACTORS.put("Car km (Electric)", 0.050);
        EMISSION_FACTORS.put("Motorcycle km", 0.089);
        EMISSION_FACTORS.put("Bus km", 0.089);
        EMISSION_FACTORS.put("Train km", 0.041);

        // Electricity
        EMISSION_FACTORS.put("kwh", 0.475);
        EMISSION_FACTORS.put("kWh", 0.475);

        // Food
        EMISSION_FACTORS.put("meal_type_meat", 6.6);
        EMISSION_FACTORS.put("meal_type_veg", 1.5);
        EMISSION_FACTORS.put("Meat (kg)", 27.0);
        EMISSION_FACTORS.put("Chicken (kg)", 6.9);
        EMISSION_FACTORS.put("Fish (kg)", 12.0);
        EMISSION_FACTORS.put("Vegetables (kg)", 0.2);
        EMISSION_FACTORS.put("Dairy (kg)", 1.5);

        // Shopping
        EMISSION_FACTORS.put("product_category_electronics", 0.5);
        EMISSION_FACTORS.put("product_category_clothing", 0.3);
        EMISSION_FACTORS.put("Electronics (units)", 50.0);
        EMISSION_FACTORS.put("Clothing (kg)", 2.0);
        EMISSION_FACTORS.put("Books (units)", 1.5);
    }

    public ActivityService(ActivityRepository activityRepository, UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public ActivityLog logActivity(LogActivityRequest request) {
        User user = getAuthenticatedUser();

        Double factor = EMISSION_FACTORS.getOrDefault(request.getActivityType(), 0.0);
        Double calculatedCO2e = request.getQuantity() * factor;

        ActivityLog activity = ActivityLog.builder()
                .user(user)
                .category(request.getCategory())
                .activityType(request.getActivityType())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .logDate(request.getLogDate())
                .calculatedEmissionsKgCO2e(calculatedCO2e)
                .build();

        return activityRepository.save(activity);
    }

    public List<ActivityLog> getRecentActivities(int limit) {
        User user = getAuthenticatedUser();

        return activityRepository.findByUserOrderByLogDateDesc(user).stream()
                .limit(limit)
                .toList();
    }

    public Double getEmissionFactor(String activityType) {
        return EMISSION_FACTORS.getOrDefault(activityType, 0.0);
    }

    // Returns the shape the dashboard UI expects: total + per-category
    // breakdown + a weekly target. The target and week-over-week comparison
    // are placeholders until Goal integration and a "last week" query are
    // wired in.
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

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalKgCo2e", round1(total));
        summary.put("weeklyTargetKg", 200.0); // TEMP placeholder until Goal entity is integrated
        summary.put("percentChangeVsLastWeek", 0.0); // TEMP placeholder — needs a "last week" comparison query
        summary.put("transportKg", round1(transport));
        summary.put("electricityKg", round1(electricity));
        summary.put("foodKg", round1(food));
        summary.put("shoppingKg", round1(shopping));
        summary.put("recommendations", List.of());
        return summary;
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
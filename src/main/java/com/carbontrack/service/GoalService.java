package com.carbontrack.service;

import com.carbontrack.dto.GoalRequest;
import com.carbontrack.dto.GoalResponse;
import com.carbontrack.dto.GoalTrajectoryPoint;
import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.Goal;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityRepository;
import com.carbontrack.repository.GoalRepository;
import com.carbontrack.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final BadgeService badgeService;
    private final NotificationService notificationService;

    public GoalService(GoalRepository goalRepository,
                       UserRepository userRepository,
                       ActivityRepository activityRepository,
                       BadgeService badgeService,
                       NotificationService notificationService) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
        this.badgeService = badgeService;
        this.notificationService = notificationService;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public GoalResponse setGoal(GoalRequest request) {
        User user = getAuthenticatedUser();

        // 1. Abandon existing active goals
        List<Goal> activeGoals = goalRepository.findByUserAndStatus(user, "active");
        for (Goal activeGoal : activeGoals) {
            activeGoal.setStatus("abandoned");
            goalRepository.save(activeGoal);
        }

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = request.getTimeframe().equalsIgnoreCase("weekly") ? startDate.plusDays(7) : startDate.plusDays(30);

        // 2. Create and persist new Goal
        Goal goal = Goal.builder()
                .user(user)
                .title("Reduce carbon emissions by " + request.getTargetReductionPercent() + "%")
                .description(request.getTimeframe() + " goal to reduce carbon footprint")
                .targetReductionPercentage(request.getTargetReductionPercent())
                .startDate(startDate)
                .endDate(endDate)
                .status("active")
                .progressPercentage(0.0)
                .onTrack(true)
                .build();

        Goal saved = goalRepository.save(goal);
        updateGoalProgress(saved);
        return mapToResponse(saved);
    }

    @Transactional
    public GoalResponse getCurrentGoal() {
        User user = getAuthenticatedUser();
        List<Goal> activeGoals = goalRepository.findByUserAndStatus(user, "active");
        if (activeGoals.isEmpty()) {
            return null;
        }
        Goal active = activeGoals.get(0);
        updateGoalProgress(active);
        return mapToResponse(active);
    }

    @Transactional
    public List<GoalResponse> getGoalHistory() {
        User user = getAuthenticatedUser();
        List<Goal> all = goalRepository.findByUserOrderByStartDateDesc(user);
        // Refresh active goals
        all.stream().filter(g -> "active".equalsIgnoreCase(g.getStatus())).forEach(this::updateGoalProgress);
        return all.stream().map(this::mapToResponse).toList();
    }

    private void updateGoalProgress(Goal goal) {
        if (!"active".equalsIgnoreCase(goal.getStatus())) {
            return;
        }
        User user = goal.getUser();
        LocalDate start = goal.getStartDate();
        LocalDate end = goal.getEndDate();
        LocalDate now = LocalDate.now();
        LocalDate queryEnd = now.isBefore(end) ? now : end;

        // Calculate current emissions in this goal's period
        Double currentEmissionsVal = activityRepository.sumByUserAndDateRange(user, start, queryEnd);
        double currentEmissions = currentEmissionsVal != null ? currentEmissionsVal : 0.0;

        long totalDays = ChronoUnit.DAYS.between(start, end);
        if (totalDays <= 0) totalDays = 7;
        long elapsedDays = ChronoUnit.DAYS.between(start, now);
        if (elapsedDays < 0) elapsedDays = 0;
        if (elapsedDays > totalDays) elapsedDays = totalDays;

        // Determine baseline
        double baseline = (totalDays <= 10) ? calculateWeeklyBaseline(user, start) : calculateMonthlyBaseline(user, start);

        double targetReductionPercent = goal.getTargetReductionPercentage();
        double targetReductionKg = baseline * (targetReductionPercent / 100.0);
        double actualReductionKg = baseline - currentEmissions;

        double progress = 0.0;
        if (actualReductionKg > 0 && targetReductionKg > 0) {
            progress = (actualReductionKg / targetReductionKg) * 100.0;
        }
        if (progress > 100.0) progress = 100.0;
        if (progress < 0.0) progress = 0.0;

        goal.setProgressPercentage(Math.round(progress * 10.0) / 10.0);

        // Project whether the goal is on track based on recent trend (last 3 days)
        LocalDate threeDaysAgo = now.minusDays(2);
        LocalDate trendStart = start.isAfter(threeDaysAgo) ? start : threeDaysAgo;
        long trendDays = ChronoUnit.DAYS.between(trendStart, now) + 1;

        Double recentEmissionsSumVal = activityRepository.sumByUserAndDateRange(user, trendStart, now);
        double recentEmissionsSum = recentEmissionsSumVal != null ? recentEmissionsSumVal : 0.0;
        double avgDailyEmissionRate = recentEmissionsSum / trendDays;

        long remainingDays = totalDays - elapsedDays;
        if (remainingDays < 0) remainingDays = 0;
        double projectedRemainingEmissions = avgDailyEmissionRate * remainingDays;
        double projectedTotalEmissions = currentEmissions + projectedRemainingEmissions;

        double allowedGoalTotal = baseline * (1.0 - (targetReductionPercent / 100.0));
        boolean projectedOnTrack = projectedTotalEmissions <= allowedGoalTotal;

        Boolean previousOnTrack = goal.getOnTrack();
        goal.setOnTrack(projectedOnTrack);

        // Auto-complete goal if now is past end date
        if (now.isAfter(end) || now.isEqual(end)) {
            if (progress >= 100.0) {
                goal.setStatus("completed");
                goal.setCompletedAt(java.time.LocalDateTime.now());
            } else {
                goal.setStatus("abandoned");
            }
        } else {
            // Check for trajectory change alerts
            if (previousOnTrack != null && previousOnTrack != projectedOnTrack) {
                String message;
                if (!projectedOnTrack) {
                    message = String.format("Correction Alert: Your recent carbon trend projects that you will miss your target reduction of %.0f%%. Try reducing travel or energy use!", targetReductionPercent);
                } else {
                    message = String.format("Encouragement Alert: Awesome job! Your recent emission trend projects you are back on track to meet your target reduction of %.0f%%!", targetReductionPercent);
                }
                notificationService.createNotification(user, message, "trajectory_change");
            }
        }
        goalRepository.save(goal);

        // Check for badges
        badgeService.checkForBadges(user);
    }

    private double calculateWeeklyBaseline(User user, LocalDate goalStartDate) {
        LocalDate startOfBaseline = goalStartDate.minusDays(7);
        Double sum = activityRepository.sumByUserAndDateRange(user, startOfBaseline, goalStartDate.minusDays(1));
        return (sum != null && sum > 0) ? sum : 200.0;
    }

    private double calculateMonthlyBaseline(User user, LocalDate goalStartDate) {
        LocalDate startOfBaseline = goalStartDate.minusDays(30);
        Double sum = activityRepository.sumByUserAndDateRange(user, startOfBaseline, goalStartDate.minusDays(1));
        return (sum != null && sum > 0) ? sum : 800.0;
    }

    private GoalResponse mapToResponse(Goal goal) {
        long days = ChronoUnit.DAYS.between(goal.getStartDate(), goal.getEndDate());
        String timeframe = days <= 10 ? "weekly" : "monthly";

        String alertMessage = (goal.getOnTrack() != null && !goal.getOnTrack()) 
            ? "Warning: Your emissions exceed the allowed pace of your carbon reduction target!" 
            : null;

        User user = goal.getUser();
        LocalDate start = goal.getStartDate();
        LocalDate end = goal.getEndDate();
        LocalDate now = LocalDate.now();

        long totalDays = days > 0 ? days : 7;
        long elapsedDays = ChronoUnit.DAYS.between(start, now);
        if (elapsedDays < 0) elapsedDays = 0;
        if (elapsedDays > totalDays) elapsedDays = totalDays;
        long remainingDays = totalDays - elapsedDays;
        if (remainingDays < 0) remainingDays = 0;

        double baseline = (totalDays <= 10) ? calculateWeeklyBaseline(user, start) : calculateMonthlyBaseline(user, start);
        double targetReductionPercent = goal.getTargetReductionPercentage();
        double targetEmissions = baseline * (1.0 - (targetReductionPercent / 100.0));

        LocalDate queryEnd = now.isBefore(end) ? now : end;
        Double currentEmissionsVal = activityRepository.sumByUserAndDateRange(user, start, queryEnd);
        double currentEmissions = currentEmissionsVal != null ? currentEmissionsVal : 0.0;

        // Recent daily average over last 3 days
        LocalDate threeDaysAgo = now.minusDays(2);
        LocalDate trendStart = start.isAfter(threeDaysAgo) ? start : threeDaysAgo;
        long trendDays = ChronoUnit.DAYS.between(trendStart, now) + 1;
        Double recentEmissionsSumVal = activityRepository.sumByUserAndDateRange(user, trendStart, now);
        double recentEmissionsSum = recentEmissionsSumVal != null ? recentEmissionsSumVal : 0.0;
        double recentDailyAvg = recentEmissionsSum / Math.max(1, trendDays);

        double dailyAllowedEmissions = targetEmissions / Math.max(1, totalDays);
        double remainingBudget = Math.max(0.0, targetEmissions - currentEmissions);
        double maxDailyAllowedRemaining = remainingDays > 0 ? (remainingBudget / remainingDays) : 0.0;
        double dailyReductionRequired = recentDailyAvg - maxDailyAllowedRemaining;

        double projectedRemaining = recentDailyAvg * remainingDays;
        double projectedTotalEmissions = currentEmissions + projectedRemaining;

        // Build trajectory data points
        List<Object[]> dailyAgg = activityRepository.aggregateEmissionsByDate(user, start, queryEnd);
        java.util.Map<LocalDate, Double> dailyEmissionsMap = new java.util.HashMap<>();
        if (dailyAgg != null) {
            for (Object[] row : dailyAgg) {
                if (row != null && row.length >= 2 && row[0] instanceof LocalDate && row[1] instanceof Number) {
                    dailyEmissionsMap.put((LocalDate) row[0], ((Number) row[1]).doubleValue());
                }
            }
        }

        List<GoalTrajectoryPoint> trajectoryData = new ArrayList<>();
        double runningActual = 0.0;
        double stepTarget = targetEmissions / Math.max(1, totalDays);

        for (int i = 0; i <= totalDays; i++) {
            LocalDate dayDate = start.plusDays(i);
            boolean isFuture = dayDate.isAfter(now);
            String dayLabel = dayDate.getDayOfWeek().toString().substring(0, 3) + " " + dayDate.getDayOfMonth();
            double targetLimit = Math.round(stepTarget * (i + 1) * 10.0) / 10.0;

            if (!isFuture) {
                double dayVal = dailyEmissionsMap.getOrDefault(dayDate, 0.0);
                runningActual += dayVal;
                double actualRounded = Math.round(dayVal * 10.0) / 10.0;
                double cumRounded = Math.round(runningActual * 10.0) / 10.0;

                trajectoryData.add(GoalTrajectoryPoint.builder()
                        .date(dayDate)
                        .dayLabel(dayLabel)
                        .actualEmissions(actualRounded)
                        .cumulativeActual(cumRounded)
                        .targetLimit(targetLimit)
                        .projectedEmissions(cumRounded)
                        .isFuture(false)
                        .build());
            } else {
                long daysAhead = ChronoUnit.DAYS.between(now, dayDate);
                double projVal = currentEmissions + (recentDailyAvg * daysAhead);
                double projRounded = Math.round(projVal * 10.0) / 10.0;

                trajectoryData.add(GoalTrajectoryPoint.builder()
                        .date(dayDate)
                        .dayLabel(dayLabel)
                        .actualEmissions(null)
                        .cumulativeActual(null)
                        .targetLimit(targetLimit)
                        .projectedEmissions(projRounded)
                        .isFuture(true)
                        .build());
            }
        }

        return GoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .description(goal.getDescription())
                .targetReductionPercent(goal.getTargetReductionPercentage())
                .timeframe(timeframe)
                .progressPercent(goal.getProgressPercentage())
                .onTrack(goal.getOnTrack())
                .startDate(goal.getStartDate())
                .endDate(goal.getEndDate())
                .status(goal.getStatus())
                .alertMessage(alertMessage)
                .baselineEmissions(Math.round(baseline * 10.0) / 10.0)
                .currentEmissions(Math.round(currentEmissions * 10.0) / 10.0)
                .targetEmissions(Math.round(targetEmissions * 10.0) / 10.0)
                .dailyAllowedEmissions(Math.round(dailyAllowedEmissions * 10.0) / 10.0)
                .recentDailyAvgEmissions(Math.round(recentDailyAvg * 10.0) / 10.0)
                .dailyReductionRequired(Math.round(dailyReductionRequired * 10.0) / 10.0)
                .remainingDays(remainingDays)
                .projectedTotalEmissions(Math.round(projectedTotalEmissions * 10.0) / 10.0)
                .trajectoryData(trajectoryData)
                .build();
    }
}

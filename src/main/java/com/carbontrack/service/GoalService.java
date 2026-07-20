package com.carbontrack.service;

import com.carbontrack.dto.GoalRequest;
import com.carbontrack.dto.GoalResponse;
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
                .build();
    }
}

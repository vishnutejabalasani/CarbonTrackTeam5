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

    public GoalService(GoalRepository goalRepository,
                       UserRepository userRepository,
                       ActivityRepository activityRepository,
                       BadgeService badgeService) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
        this.badgeService = badgeService;
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
        for (Goal oldGoal : activeGoals) {
            oldGoal.setStatus("abandoned");
            goalRepository.save(oldGoal);
        }

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = request.getTimeframe().equalsIgnoreCase("weekly") ? startDate.plusDays(7) : startDate.plusDays(30);

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

        Goal savedGoal = goalRepository.save(goal);
        
        // Check for badges
        badgeService.checkForBadges(user);

        return mapToResponse(savedGoal);
    }

    @Transactional
    public GoalResponse getCurrentGoal() {
        User user = getAuthenticatedUser();
        List<Goal> activeGoals = goalRepository.findByUserAndStatus(user, "active");
        if (activeGoals.isEmpty()) {
            return null;
        }
        Goal goal = activeGoals.get(0);
        updateGoalProgress(goal);
        return mapToResponse(goal);
    }

    @Transactional
    public List<GoalResponse> getGoalHistory() {
        User user = getAuthenticatedUser();
        List<Goal> goals = goalRepository.findByUser(user);
        
        // Refresh progress of active goals on history query
        for (Goal goal : goals) {
            if ("active".equalsIgnoreCase(goal.getStatus())) {
                updateGoalProgress(goal);
            }
        }
        
        return goals.stream().map(this::mapToResponse).toList();
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
        List<ActivityLog> logs = activityRepository.findByUserOrderByLogDateDesc(user).stream()
                .filter(a -> a.getLogDate().isAfter(start.minusDays(1)) && a.getLogDate().isBefore(queryEnd.plusDays(1)))
                .toList();
        double currentEmissions = logs.stream()
                .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                .sum();

        long totalDays = ChronoUnit.DAYS.between(start, end);
        if (totalDays <= 0) totalDays = 7;
        long elapsedDays = ChronoUnit.DAYS.between(start, now);
        if (elapsedDays < 0) elapsedDays = 0;
        if (elapsedDays > totalDays) elapsedDays = totalDays;

        // Determine baseline
        double baseline = 200.0;
        if (totalDays <= 10) {
            baseline = calculateWeeklyBaseline(user, start);
        } else {
            baseline = calculateMonthlyBaseline(user, start);
        }

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

        // On track if emissions so far are within the scaled allowance
        double allowedSoFar = baseline * (1.0 - (targetReductionPercent / 100.0) * ((double) elapsedDays / totalDays));
        goal.setOnTrack(currentEmissions <= allowedSoFar);

        // Auto-complete goal if now is past end date
        if (now.isAfter(end) || now.isEqual(end)) {
            if (progress >= 100.0) {
                goal.setStatus("completed");
                goal.setCompletedAt(java.time.LocalDateTime.now());
            } else {
                goal.setStatus("abandoned");
            }
        }
        goalRepository.save(goal);
        
        // Check for badges
        badgeService.checkForBadges(user);
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

    private double calculateMonthlyBaseline(User user, LocalDate goalStartDate) {
        LocalDate startOfBaseline = goalStartDate.minusDays(30);
        List<ActivityLog> baselineActivities = activityRepository.findByUserOrderByLogDateDesc(user).stream()
                .filter(a -> a.getLogDate().isAfter(startOfBaseline.minusDays(1)) && a.getLogDate().isBefore(goalStartDate))
                .toList();
        double baselineSum = baselineActivities.stream()
                .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                .sum();
        return baselineSum > 0 ? baselineSum : 800.0;
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

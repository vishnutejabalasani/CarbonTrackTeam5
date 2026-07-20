package com.carbontrack.service;

import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.Badge;
import com.carbontrack.entity.Goal;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityRepository;
import com.carbontrack.repository.BadgeRepository;
import com.carbontrack.repository.GoalRepository;
import com.carbontrack.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class BadgeService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final ActivityRepository activityRepository;
    private final GoalRepository goalRepository;
    private final NotificationService notificationService;

    public BadgeService(UserRepository userRepository,
                        BadgeRepository badgeRepository,
                        ActivityRepository activityRepository,
                        GoalRepository goalRepository,
                        NotificationService notificationService) {
        this.userRepository = userRepository;
        this.badgeRepository = badgeRepository;
        this.activityRepository = activityRepository;
        this.goalRepository = goalRepository;
        this.notificationService = notificationService;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public List<Badge> getEarnedBadges() {
        User user = getAuthenticatedUser();
        // Force refresh to get latest state
        return new ArrayList<>(userRepository.findById(user.getId())
                .map(User::getBadges)
                .orElse(Collections.emptySet()));
    }

    @Transactional
    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    @Transactional
    public void checkForBadges(User user) {
        // Retrieve fresh user state
        User freshUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + user.getId()));

        Set<Badge> currentBadges = freshUser.getBadges();
        List<ActivityLog> allLogs = activityRepository.findByUserOrderByLogDateDesc(freshUser);
        List<Goal> completedGoals = goalRepository.findByUserAndStatus(freshUser, "completed");

        boolean changed = false;

        // 1. "First Step" - Logged first activity
        if (!hasBadge(currentBadges, "First Step") && !allLogs.isEmpty()) {
            awardBadge(freshUser, "First Step");
            notificationService.createNotification(freshUser, "Congratulations! You earned the 'First Step' badge for logging your first footprint activity!", "badge_earned");
            changed = true;
        }

        // 2. "Weekly Warrior" / "Carbon Conscious" - Logged daily/consecutive activities
        if (!hasBadge(currentBadges, "Weekly Warrior") || !hasBadge(currentBadges, "Carbon Conscious")) {
            long distinctDaysInLastWeek = allLogs.stream()
                    .map(ActivityLog::getLogDate)
                    .filter(date -> date.isAfter(LocalDate.now().minusDays(8)))
                    .distinct()
                    .count();
            if (distinctDaysInLastWeek >= 7) {
                if (!hasBadge(currentBadges, "Weekly Warrior")) {
                    awardBadge(freshUser, "Weekly Warrior");
                    notificationService.createNotification(freshUser, "Congratulations! You earned the 'Weekly Warrior' badge for logging daily for 7 days!", "badge_earned");
                    changed = true;
                }
                if (!hasBadge(currentBadges, "Carbon Conscious")) {
                    awardBadge(freshUser, "Carbon Conscious");
                    notificationService.createNotification(freshUser, "Congratulations! You earned the 'Carbon Conscious' badge for logging daily for 7 days!", "badge_earned");
                    changed = true;
                }
            }
        }

        // 3. "Goal Getter" - Completed 3 goals
        if (!hasBadge(currentBadges, "Goal Getter") && completedGoals.size() >= 3) {
            awardBadge(freshUser, "Goal Getter");
            notificationService.createNotification(freshUser, "Congratulations! You earned the 'Goal Getter' badge for completing 3 carbon reduction goals!", "badge_earned");
            changed = true;
        }

        // 4. "Green Champion" / "Eco Warrior" - Carbon footprint reduction achievements
        if (!hasBadge(currentBadges, "Green Champion") || !hasBadge(currentBadges, "Eco Warrior")) {
            double maxReduction = completedGoals.stream()
                    .mapToDouble(Goal::getTargetReductionPercentage)
                    .max()
                    .orElse(0.0);

            if (maxReduction >= 25.0 && !hasBadge(currentBadges, "Green Champion")) {
                awardBadge(freshUser, "Green Champion");
                notificationService.createNotification(freshUser, "Congratulations! You earned the 'Green Champion' badge for achieving a 25% target reduction goal!", "badge_earned");
                changed = true;
            }
            if (maxReduction >= 50.0 && !hasBadge(currentBadges, "Eco Warrior")) {
                awardBadge(freshUser, "Eco Warrior");
                notificationService.createNotification(freshUser, "Congratulations! You earned the 'Eco Warrior' badge for achieving a 50% target reduction goal!", "badge_earned");
                changed = true;
            }
        }

        // 5. "Transport Hero" - Logged transport transit
        if (!hasBadge(currentBadges, "Transport Hero")) {
            boolean hasTransportLog = allLogs.stream()
                    .anyMatch(l -> "transport".equalsIgnoreCase(l.getCategory()) && 
                                  ("bus_km".equalsIgnoreCase(l.getActivityType()) || "train_km".equalsIgnoreCase(l.getActivityType())));
            if (hasTransportLog) {
                awardBadge(freshUser, "Transport Hero");
                notificationService.createNotification(freshUser, "Congratulations! You earned the 'Transport Hero' badge for logging clean public transit!", "badge_earned");
                changed = true;
            }
        }

        // 6. "First Goal Achieved" Milestone Badge
        if (!hasBadge(currentBadges, "First Goal Achieved") && !completedGoals.isEmpty()) {
            awardBadge(freshUser, "First Goal Achieved");
            notificationService.createNotification(freshUser, "Congratulations! You earned the 'First Goal Achieved' badge for completing your first carbon reduction goal!", "badge_earned");
            changed = true;
        }

        // 7. Absolute CO2e Savings Badges: Carbon Saver 10/25/50 kg
        double totalReductionKg = 0.0;
        for (Goal g : completedGoals) {
            LocalDate start = g.getStartDate();
            LocalDate end = g.getEndDate();
            long days = java.time.temporal.ChronoUnit.DAYS.between(start, end);
            double baseline = (days <= 10)
                    ? calculateWeeklyBaseline(freshUser, start)
                    : calculateMonthlyBaseline(freshUser, start);
            Double currentEmissionsVal = activityRepository.sumByUserAndDateRange(freshUser, start, end);
            double currentEmissions = currentEmissionsVal != null ? currentEmissionsVal : 0.0;
            totalReductionKg += Math.max(0.0, baseline - currentEmissions);
        }

        if (!hasBadge(currentBadges, "Carbon Saver 10kg") && totalReductionKg >= 10.0) {
            awardBadge(freshUser, "Carbon Saver 10kg");
            notificationService.createNotification(freshUser, "Congratulations! You earned the 'Carbon Saver 10kg' badge for saving over 10 kg CO2e in goals!", "badge_earned");
            changed = true;
        }
        if (!hasBadge(currentBadges, "Carbon Saver 25kg") && totalReductionKg >= 25.0) {
            awardBadge(freshUser, "Carbon Saver 25kg");
            notificationService.createNotification(freshUser, "Congratulations! You earned the 'Carbon Saver 25kg' badge for saving over 25 kg CO2e in goals!", "badge_earned");
            changed = true;
        }
        if (!hasBadge(currentBadges, "Carbon Saver 50kg") && totalReductionKg >= 50.0) {
            awardBadge(freshUser, "Carbon Saver 50kg");
            notificationService.createNotification(freshUser, "Congratulations! You earned the 'Carbon Saver 50kg' badge for saving over 50 kg CO2e in goals!", "badge_earned");
            changed = true;
        }

        if (changed) {
            userRepository.save(freshUser);
        }
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

    @org.springframework.context.event.EventListener
    @org.springframework.scheduling.annotation.Async
    @Transactional
    public void handleActivityLogged(com.carbontrack.event.ActivityLoggedEvent event) {
        checkForBadges(event.getUser());
    }

    private boolean hasBadge(Set<Badge> badges, String name) {
        return badges.stream().anyMatch(b -> b.getName().equalsIgnoreCase(name));
    }

    private void awardBadge(User user, String name) {
        badgeRepository.findByName(name).ifPresent(badge -> {
            user.getBadges().add(badge);
        });
    }
}

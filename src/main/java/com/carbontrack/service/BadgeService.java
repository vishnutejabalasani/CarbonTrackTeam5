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

    public BadgeService(UserRepository userRepository,
                        BadgeRepository badgeRepository,
                        ActivityRepository activityRepository,
                        GoalRepository goalRepository) {
        this.userRepository = userRepository;
        this.badgeRepository = badgeRepository;
        this.activityRepository = activityRepository;
        this.goalRepository = goalRepository;
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
                    changed = true;
                }
                if (!hasBadge(currentBadges, "Carbon Conscious")) {
                    awardBadge(freshUser, "Carbon Conscious");
                    changed = true;
                }
            }
        }

        // 3. "Goal Getter" - Completed 3 goals
        if (!hasBadge(currentBadges, "Goal Getter") && completedGoals.size() >= 3) {
            awardBadge(freshUser, "Goal Getter");
            changed = true;
        }

        // 4. "Green Champion" / "Eco Warrior" - Carbon footprint reduction achievements
        // We can inspect past goals to see if they achieved 25% or 50% target reduction percentage
        if (!hasBadge(currentBadges, "Green Champion") || !hasBadge(currentBadges, "Eco Warrior")) {
            double maxReduction = completedGoals.stream()
                    .mapToDouble(Goal::getTargetReductionPercentage)
                    .max()
                    .orElse(0.0);

            if (maxReduction >= 25.0 && !hasBadge(currentBadges, "Green Champion")) {
                awardBadge(freshUser, "Green Champion");
                changed = true;
            }
            if (maxReduction >= 50.0 && !hasBadge(currentBadges, "Eco Warrior")) {
                awardBadge(freshUser, "Eco Warrior");
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
                changed = true;
            }
        }

        if (changed) {
            userRepository.save(freshUser);
        }
    }

    @org.springframework.context.event.EventListener
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

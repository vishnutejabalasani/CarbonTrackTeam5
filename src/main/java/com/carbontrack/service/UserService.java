package com.carbontrack.service;

import com.carbontrack.entity.User;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.dto.UpdateProfileRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final com.carbontrack.repository.ActivityRepository activityRepository;
    private final com.carbontrack.repository.GoalRepository goalRepository;

    public UserService(UserRepository userRepository, 
                       com.carbontrack.repository.ActivityRepository activityRepository, 
                       com.carbontrack.repository.GoalRepository goalRepository) {
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
        this.goalRepository = goalRepository;
    }

    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Transactional
    public User updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        user.setPreferredUnit(request.getPreferredUnit());
        user.setGoalVisibility(request.getGoalVisibility());

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> getLeaderboard() {
        java.time.LocalDate start = java.time.LocalDate.now().minusDays(7);
        java.time.LocalDate end = java.time.LocalDate.now();
        
        // 1. Fetch all users
        java.util.List<User> users = userRepository.findAll();
        
        // 2. Fetch all emissions aggregates for the last 7 days in a single query
        java.util.List<Object[]> emissionsResults = activityRepository.sumAllUsersEmissionsInDateRange(start, end);
        java.util.Map<Long, Double> userEmissionsMap = new java.util.HashMap<>();
        for (Object[] row : emissionsResults) {
            if (row[0] != null && row[1] != null) {
                Long userId = ((Number) row[0]).longValue();
                Double sum = ((Number) row[1]).doubleValue();
                userEmissionsMap.put(userId, sum);
            }
        }
        
        // 3. Fetch all active goals in a single query
        java.util.List<com.carbontrack.entity.Goal> activeGoals = goalRepository.findByStatus("active");
        java.util.Map<Long, com.carbontrack.entity.Goal> userGoalsMap = new java.util.HashMap<>();
        for (com.carbontrack.entity.Goal g : activeGoals) {
            if (g.getUser() != null) {
                userGoalsMap.put(g.getUser().getId(), g);
            }
        }
        
        java.util.List<java.util.Map<String, Object>> leaderboard = new java.util.ArrayList<>();
        
        for (User u : users) {
            Double totalEmissions = userEmissionsMap.getOrDefault(u.getId(), 0.0);
            
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("name", u.getFullName() != null && !u.getFullName().isEmpty() ? u.getFullName() : u.getUsername());
            map.put("email", u.getEmail());
            map.put("total", Math.round(totalEmissions * 10) / 10.0);
            
            java.util.List<java.util.Map<String, Object>> userBadges = new java.util.ArrayList<>();
            for (com.carbontrack.entity.Badge b : u.getBadges()) {
                java.util.Map<String, Object> bm = new java.util.HashMap<>();
                bm.put("id", b.getId());
                bm.put("name", b.getName());
                bm.put("description", b.getDescription());
                bm.put("iconUrl", b.getIconUrl());
                userBadges.add(bm);
            }
            map.put("badges", userBadges);
            
            com.carbontrack.entity.Goal activeGoal = userGoalsMap.get(u.getId());
            double reductionPercent = 0.0;
            if (activeGoal != null) {
                reductionPercent = activeGoal.getProgressPercentage();
            } else {
                reductionPercent = totalEmissions < 150.0 ? 30.0 : 10.0;
            }
            map.put("reduction", Math.round(reductionPercent) + "%");
            
            leaderboard.add(map);
        }
        
        // Sort: lowest total emissions first
        leaderboard.sort((m1, m2) -> Double.compare((Double) m1.get("total"), (Double) m2.get("total")));
        
        int rank = 1;
        for (java.util.Map<String, Object> entry : leaderboard) {
            entry.put("rank", rank++);
        }
        
        return leaderboard;
    }
}

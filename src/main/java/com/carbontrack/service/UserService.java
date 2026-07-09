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
        java.util.List<User> users = userRepository.findAll();
        
        java.util.List<java.util.Map<String, Object>> leaderboard = new java.util.ArrayList<>();
        
        for (User u : users) {
            Double totalEmissions = activityRepository.sumByUserAndDateRange(u, start, java.time.LocalDate.now());
            if (totalEmissions == null) totalEmissions = 0.0;
            
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("name", u.getFullName() != null && !u.getFullName().isEmpty() ? u.getFullName() : u.getUsername());
            map.put("email", u.getEmail());
            map.put("total", Math.round(totalEmissions * 10) / 10.0);
            
            java.util.List<com.carbontrack.entity.Goal> activeGoals = goalRepository.findByUserAndStatus(u, "active");
            double reductionPercent = 0.0;
            if (!activeGoals.isEmpty()) {
                reductionPercent = activeGoals.get(0).getProgressPercentage();
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

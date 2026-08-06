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
            
            // Category Strengths calculation
            java.util.List<java.util.Map<String, Object>> strengths = new java.util.ArrayList<>();
            java.util.List<Object[]> catEmissions = activityRepository.aggregateEmissionsByCategory(u, start, end);
            java.util.Map<String, Double> catMap = new java.util.HashMap<>();
            for (Object[] row : catEmissions) {
                if (row[0] != null && row[1] != null) {
                    catMap.put(row[0].toString().toLowerCase(), ((Number) row[1]).doubleValue());
                }
            }
            
            double transportVal = catMap.getOrDefault("transport", 25.0);
            double electricityVal = catMap.getOrDefault("electricity", 30.0);
            double foodVal = catMap.getOrDefault("food", 15.0);
            double shoppingVal = catMap.getOrDefault("shopping", 10.0);
            
            if (transportVal < 35.0) {
                java.util.Map<String, Object> s = new java.util.HashMap<>();
                s.put("category", "Transport");
                s.put("label", "Transit Commuter");
                s.put("icon", "🚌");
                s.put("strengthScore", "Top 10%");
                s.put("impact", "-45% CO₂");
                strengths.add(s);
            }
            if (electricityVal < 40.0) {
                java.util.Map<String, Object> s = new java.util.HashMap<>();
                s.put("category", "Electricity");
                s.put("label", "Smart LED Saver");
                s.put("icon", "⚡");
                s.put("strengthScore", "Top 5%");
                s.put("impact", "-50% CO₂");
                strengths.add(s);
            }
            if (foodVal < 25.0) {
                java.util.Map<String, Object> s = new java.util.HashMap<>();
                s.put("category", "Food");
                s.put("label", "Plant-Based Champion");
                s.put("icon", "🥗");
                s.put("strengthScore", "Top 15%");
                s.put("impact", "-38% CO₂");
                strengths.add(s);
            }
            if (shoppingVal < 20.0) {
                java.util.Map<String, Object> s = new java.util.HashMap<>();
                s.put("category", "Shopping");
                s.put("label", "Circular Shopper");
                s.put("icon", "🛍️");
                s.put("strengthScore", "Zero Waste");
                s.put("impact", "-30% CO₂");
                strengths.add(s);
            }
            if (strengths.isEmpty()) {
                java.util.Map<String, Object> s = new java.util.HashMap<>();
                s.put("category", "General");
                s.put("label", "Consistent Tracker");
                s.put("icon", "🌱");
                s.put("strengthScore", "Active Saver");
                s.put("impact", "-25% CO₂");
                strengths.add(s);
            }
            map.put("categoryStrengths", strengths);
            
            // Follow Their Habits / Tips
            java.util.List<java.util.Map<String, Object>> habits = new java.util.ArrayList<>();
            
            java.util.Map<String, Object> h1 = new java.util.HashMap<>();
            h1.put("id", "h-" + u.getId() + "-1");
            h1.put("title", "Public Transit / EV Commuting");
            h1.put("category", "Transport");
            h1.put("desc", "Uses electric rail or carpooling 4x per week instead of solo gasoline vehicle driving.");
            h1.put("impact", "-18.5 kg CO₂/wk");
            h1.put("tip", "Reserve 2 commute days per week for public transport or WFH to save up to 150 kg CO₂ per month.");
            habits.add(h1);
            
            java.util.Map<String, Object> h2 = new java.util.HashMap<>();
            h2.put("id", "h-" + u.getId() + "-2");
            h2.put("title", "Smart Power Strip Cutoff");
            h2.put("category", "Electricity");
            h2.put("desc", "Eliminates phantom appliance draw overnight using scheduled automated power strips.");
            h2.put("impact", "-11.2 kg CO₂/wk");
            h2.put("tip", "Plug home office workstation gear into a master smart switch that shuts off after 8 PM.");
            habits.add(h2);
            
            java.util.Map<String, Object> h3 = new java.util.HashMap<>();
            h3.put("id", "h-" + u.getId() + "-3");
            h3.put("title", "Plant-Forward Dinners (3x/wk)");
            h3.put("category", "Food");
            h3.put("desc", "Substitutes high-impact red meats with organic legumes, tofu, and seasonal produce.");
            h3.put("impact", "-8.7 kg CO₂/wk");
            h3.put("tip", "Swap beef or pork for lentils or mushrooms 3 days a week for an instant 35% food footprint drop.");
            habits.add(h3);
            
            map.put("habits", habits);
            
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

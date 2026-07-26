package com.carbontrack.controller;

import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityRepository;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping({"/api/dashboard", "/dashboard"})
public class DashboardController {

    private final ActivityService activityService;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public DashboardController(ActivityService activityService,
                               ActivityRepository activityRepository,
                               UserRepository userRepository) {
        this.activityService = activityService;
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        Map<String, Object> summary = activityService.getWeeklySummary();
        List<ActivityLog> recent = activityService.getRecentActivities(5);

        Map<String, Object> response = new LinkedHashMap<>(summary);
        response.put("recentActivities", recent);
        response.put("status", "success");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/weekly-emissions")
    public ResponseEntity<Map<String, Object>> getWeeklyEmissionsChartData() {
        User user = getAuthenticatedUser();
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6);

        List<ActivityLog> logs = activityRepository.findByUserOrderByLogDateDesc(user);

        List<Map<String, Object>> dailyData = new ArrayList<>();
        double weeklyTotal = 0.0;
        double highestValue = -1.0;
        String highestDay = "N/A";
        double lowestValue = Double.MAX_VALUE;
        String lowestDay = "N/A";

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dayName = date.getDayOfWeek().name().substring(0, 3);

            List<ActivityLog> dayLogs = logs.stream()
                    .filter(a -> a.getLogDate().isEqual(date))
                    .toList();

            double transport = dayLogs.stream()
                    .filter(a -> "transport".equalsIgnoreCase(a.getCategory()))
                    .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                    .sum();

            double electricity = dayLogs.stream()
                    .filter(a -> "electricity".equalsIgnoreCase(a.getCategory()))
                    .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                    .sum();

            double food = dayLogs.stream()
                    .filter(a -> "food".equalsIgnoreCase(a.getCategory()))
                    .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                    .sum();

            double shopping = dayLogs.stream()
                    .filter(a -> "shopping".equalsIgnoreCase(a.getCategory()))
                    .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                    .sum();

            double totalDay = round1(transport + electricity + food + shopping);
            weeklyTotal += totalDay;

            if (totalDay > highestValue) {
                highestValue = totalDay;
                highestDay = dayName + " (" + totalDay + " kg)";
            }

            if (totalDay < lowestValue) {
                lowestValue = totalDay;
                lowestDay = dayName + " (" + totalDay + " kg)";
            }

            Map<String, Object> dayMap = new LinkedHashMap<>();
            dayMap.put("date", date.toString());
            dayMap.put("day", dayName);
            dayMap.put("emissions", totalDay);
            dayMap.put("transport", round1(transport));
            dayMap.put("electricity", round1(electricity));
            dayMap.put("food", round1(food));
            dayMap.put("shopping", round1(shopping));

            dailyData.add(dayMap);
        }

        if (lowestValue == Double.MAX_VALUE) {
            lowestValue = 0.0;
            lowestDay = "N/A";
        }

        double averageDaily = round1(weeklyTotal / 7.0);
        weeklyTotal = round1(weeklyTotal);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("weeklyTotal", weeklyTotal);
        response.put("highestDay", highestDay);
        response.put("lowestDay", lowestDay);
        response.put("averageDailyEmissions", averageDaily);
        response.put("dailyData", dailyData);

        return ResponseEntity.ok(response);
    }

    private double round1(double val) {
        return Math.round(val * 10.0) / 10.0;
    }
}

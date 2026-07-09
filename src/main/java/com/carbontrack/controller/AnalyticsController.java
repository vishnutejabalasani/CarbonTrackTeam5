package com.carbontrack.controller;

import com.carbontrack.service.ActivityService;
import com.carbontrack.service.UserService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final ActivityService activityService;
    private final UserService userService;

    public AnalyticsController(ActivityService activityService, UserService userService) {
        this.activityService = activityService;
        this.userService = userService;
    }

    @GetMapping("/category")
    public ResponseEntity<List<Map<String, Object>>> getEmissionsByCategory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(activityService.getEmissionsByCategory(startDate, endDate));
    }

    @GetMapping("/trend")
    public ResponseEntity<List<Map<String, Object>>> getEmissionsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(activityService.getEmissionsByDate(startDate, endDate));
    }

    @GetMapping("/benchmarking")
    public ResponseEntity<Map<String, Object>> getPeerBenchmarking() {
        return ResponseEntity.ok(activityService.getPeerBenchmarking());
    }

    @GetMapping("/organization")
    public ResponseEntity<Map<String, Object>> getOrganizationDashboard() {
        return ResponseEntity.ok(activityService.getOrganizationDashboard());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard() {
        return ResponseEntity.ok(userService.getLeaderboard());
    }
}

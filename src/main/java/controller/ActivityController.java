package com.carbontrack.controller;

import com.carbontrack.dto.LogActivityRequest;
import com.carbontrack.entity.ActivityLog;
import com.carbontrack.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping
    public ResponseEntity<ActivityLog> logActivity(@RequestBody LogActivityRequest request) {
        return ResponseEntity.ok(activityService.logActivity(request));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityLog>> getRecent(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(activityService.getRecentActivities(limit));
    }
    @GetMapping("/emission-factor/{activityType}")
    public ResponseEntity<Double> getEmissionFactor(@PathVariable String activityType) {
        return ResponseEntity.ok(activityService.getEmissionFactor(activityType));
    }

    @GetMapping("/summary/weekly")
    public ResponseEntity<Map<String, Object>> getWeeklySummary() {
        return ResponseEntity.ok(activityService.getWeeklySummary());
    }
}
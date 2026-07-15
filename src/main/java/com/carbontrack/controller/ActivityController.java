package com.carbontrack.controller;

import com.carbontrack.dto.LogActivityRequest;
import com.carbontrack.entity.ActivityLog;
import com.carbontrack.service.ActivityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getActivities(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        LocalDate start = startDate != null && !startDate.isEmpty() ? LocalDate.parse(startDate) : null;
        LocalDate end = endDate != null && !endDate.isEmpty() ? LocalDate.parse(endDate) : null;

        return ResponseEntity.ok(activityService.getFilteredActivities(
                category, start, end, sortBy, sortOrder, page, pageSize));
    }

    @PostMapping
    public ResponseEntity<ActivityLog> logActivity(@Valid @RequestBody LogActivityRequest request) {
        return ResponseEntity.ok(activityService.logActivity(request));
    }

    @PostMapping("/transport")
    public ResponseEntity<ActivityLog> logTransportActivity(@Valid @RequestBody LogActivityRequest request) {
        request.setCategory("transport");
        return ResponseEntity.ok(activityService.logActivity(request));
    }

    @PostMapping("/electricity")
    public ResponseEntity<ActivityLog> logElectricityActivity(@Valid @RequestBody LogActivityRequest request) {
        request.setCategory("electricity");
        return ResponseEntity.ok(activityService.logActivity(request));
    }

    @PostMapping("/food")
    public ResponseEntity<ActivityLog> logFoodActivity(@Valid @RequestBody LogActivityRequest request) {
        request.setCategory("food");
        return ResponseEntity.ok(activityService.logActivity(request));
    }

    @PostMapping("/shopping")
    public ResponseEntity<ActivityLog> logShoppingActivity(@Valid @RequestBody LogActivityRequest request) {
        request.setCategory("shopping");
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

    @GetMapping({"/summary/weekly", "/weekly-summary"})
    public ResponseEntity<Map<String, Object>> getWeeklySummary() {
        return ResponseEntity.ok(activityService.getWeeklySummary());
    }
    @GetMapping("/aggregation/category")
    public ResponseEntity<?> getCategoryAggregation(
            @RequestParam String startDate,
            @RequestParam String endDate) {

        return ResponseEntity.ok(
                activityService.getEmissionsByCategory(
                        LocalDate.parse(startDate),
                        LocalDate.parse(endDate)
                )
        );
    }

    @GetMapping("/aggregation/date")
    public ResponseEntity<?> getDateAggregation(
            @RequestParam String startDate,
            @RequestParam String endDate) {

        return ResponseEntity.ok(
                activityService.getEmissionsByDate(
                        LocalDate.parse(startDate),
                        LocalDate.parse(endDate)
                )
        );
    }
    @GetMapping("/peer-benchmark")
    public ResponseEntity<?> getPeerBenchmark() {
        return ResponseEntity.ok(
                activityService.getPeerBenchmarking()
        );
    }
    @GetMapping("/organization-dashboard")
    public ResponseEntity<?> getOrganizationDashboard() {
        return ResponseEntity.ok(
                activityService.getOrganizationDashboard()
        );
    }
}
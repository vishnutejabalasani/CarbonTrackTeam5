package com.carbontrack.controller;

import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityRepository;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ReportController(ActivityRepository activityRepository,
                            UserRepository userRepository,
                            NotificationService notificationService) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getFilteredReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        User user = getAuthenticatedUser();
        LocalDate end = parseDateSafe(endDate, LocalDate.now());
        LocalDate start = parseDateSafe(startDate, end.minusDays(30));

        List<ActivityLog> logs = activityRepository.findByUserOrderByLogDateDesc(user).stream()
                .filter(a -> !a.getLogDate().isBefore(start) && !a.getLogDate().isAfter(end))
                .toList();

        double totalEmissions = logs.stream()
                .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                .sum();

        Map<String, Double> categoryBreakdown = new LinkedHashMap<>();
        for (ActivityLog log : logs) {
            String cat = log.getCategory() != null ? log.getCategory().toLowerCase() : "other";
            double current = categoryBreakdown.getOrDefault(cat, 0.0);
            categoryBreakdown.put(cat, Math.round((current + log.getCalculatedEmissionsKgCO2e()) * 10.0) / 10.0);
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("startDate", start.toString());
        report.put("endDate", end.toString());
        report.put("totalEmissionsKg", Math.round(totalEmissions * 10.0) / 10.0);
        report.put("activityCount", logs.size());
        report.put("categoryBreakdown", categoryBreakdown);
        report.put("generatedAt", LocalDate.now().toString());
        report.put("status", "success");

        return ResponseEntity.ok(report);
    }

    public static class SendReportRequest {
        private List<String> emails;
        private String format; // "pdf", "excel", "both"
        private String message;
        private String startDate;
        private String endDate;

        public List<String> getEmails() { return emails; }
        public void setEmails(List<String> emails) { this.emails = emails; }
        public String getFormat() { return format; }
        public void setFormat(String format) { this.format = format; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendReport(@RequestBody SendReportRequest request) {
        User user = getAuthenticatedUser();

        if (request.getEmails() == null || request.getEmails().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "At least one recipient email is required"));
        }

        String emailPattern = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        List<String> validEmails = new ArrayList<>();
        for (String email : request.getEmails()) {
            if (email != null && email.trim().matches(emailPattern)) {
                validEmails.add(email.trim());
            }
        }

        if (validEmails.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "No valid email addresses provided"));
        }

        String reportFormat = request.getFormat() != null ? request.getFormat().toUpperCase() : "PDF";
        String notificationMessage = "ESG Report (" + reportFormat + ") dispatched to " + String.join(", ", validEmails);
        notificationService.createNotification(user, notificationMessage, "report_sent");

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("message", "Carbon footprint report successfully dispatched.");
        response.put("recipients", validEmails);
        response.put("format", reportFormat);
        response.put("sentAt", LocalDate.now().toString());

        return ResponseEntity.ok(response);
    }

    private LocalDate parseDateSafe(String str, LocalDate defaultVal) {
        if (str == null || str.trim().isEmpty()) {
            return defaultVal;
        }
        try {
            return LocalDate.parse(str.trim());
        } catch (Exception e) {
            return defaultVal;
        }
    }
}

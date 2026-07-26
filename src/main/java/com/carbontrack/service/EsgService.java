package com.carbontrack.service;

import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.EsgReport;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityRepository;
import com.carbontrack.repository.EsgReportRepository;
import com.carbontrack.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class EsgService {

    private final EsgReportRepository esgReportRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public EsgService(EsgReportRepository esgReportRepository,
                      ActivityRepository activityRepository,
                      UserRepository userRepository,
                      ActivityService activityService) {
        this.esgReportRepository = esgReportRepository;
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public EsgReport generateAndSaveReport() {
        User user = getAuthenticatedUser();
        LocalDate now = LocalDate.now();
        LocalDate weekAgo = now.minusDays(7);
        LocalDate monthAgo = now.minusDays(30);

        List<ActivityLog> allLogs = activityRepository.findByUserOrderByLogDateDesc(user);

        double totalEmissions = allLogs.stream()
                .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                .sum();

        double weeklyEmissions = allLogs.stream()
                .filter(a -> !a.getLogDate().isBefore(weekAgo))
                .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                .sum();

        double monthlyEmissions = allLogs.stream()
                .filter(a -> !a.getLogDate().isBefore(monthAgo))
                .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                .sum();

        Map<String, Double> categoryEmissions = new HashMap<>();
        for (String cat : List.of("transport", "electricity", "food", "shopping")) {
            double catSum = allLogs.stream()
                    .filter(a -> cat.equalsIgnoreCase(a.getCategory()))
                    .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                    .sum();
            categoryEmissions.put(cat, round2(catSum));
        }

        Map<String, Object> socialEmployeeMetrics = Map.of(
                "diversityScore", 88.0,
                "trainingHoursPerEmployee", 24.5,
                "healthSafetyIndex", 97.8,
                "employeeSatisfactionRate", 91.2
        );

        Map<String, Object> socialCommunityMetrics = Map.of(
                "communityEcoInvestment", "$15,000",
                "treesRestoredCount", Math.max(12, (int) Math.round(totalEmissions / 10.0)),
                "cleanEnergyProjectsSupported", 4,
                "volunteerHours", 140
        );

        Map<String, Object> governanceMetrics = Map.of(
                "regulatoryCompliancePercentage", 99.4,
                "ethicsPolicyCoverage", 100.0,
                "dataPrivacyAuditPassed", true,
                "boardSustainabilityOversight", "Implemented"
        );

        List<Map<String, String>> recommendations = activityService.getPersonalizedRecommendations(user);

        List<Map<String, Object>> weeklyEmissionsBreakdown = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = now.minusDays(i);
            double dayEmissions = allLogs.stream()
                    .filter(a -> a.getLogDate().isEqual(date))
                    .mapToDouble(a -> a.getCalculatedEmissionsKgCO2e() != null ? a.getCalculatedEmissionsKgCO2e() : 0.0)
                    .sum();

            weeklyEmissionsBreakdown.add(Map.of(
                    "date", date.toString(),
                    "day", date.getDayOfWeek().name().substring(0, 3),
                    "emissionsKg", round2(dayEmissions)
            ));
        }

        Map<String, Object> chartsSummary = Map.of(
                "weeklyTrend", weeklyEmissionsBreakdown,
                "categoryBreakdown", categoryEmissions
        );

        double esgScore = Math.min(98.0, Math.max(72.0, 92.0 - (weeklyEmissions / 20.0)));
        double auditScore = Math.min(99.0, Math.max(80.0, 95.0 - (monthlyEmissions / 100.0)));

        EsgReport report = EsgReport.builder()
                .user(user)
                .companyName(user.getFullName() != null ? user.getFullName() + " Sustainability Hub" : "CarbonTrack Enterprise")
                .reportTitle("ESG Analytics & Sustainability Audit Report")
                .auditDate(now)
                .generatedTime(LocalDateTime.now())
                .overallEsgScore(round2(esgScore))
                .totalCarbonEmissions(round2(totalEmissions))
                .weeklyEmissions(round2(weeklyEmissions))
                .monthlyEmissions(round2(monthlyEmissions))
                .categoryEmissions(categoryEmissions)
                .socialEmployeeMetrics(socialEmployeeMetrics)
                .socialCommunityMetrics(socialCommunityMetrics)
                .governanceMetrics(governanceMetrics)
                .auditScore(round2(auditScore))
                .recommendations(recommendations)
                .chartsSummary(chartsSummary)
                .createdAt(LocalDateTime.now())
                .build();

        return esgReportRepository.save(report);
    }

    public EsgReport getReportById(Long id) {
        User user = getAuthenticatedUser();
        if (id == null || id == 0) {
            return generateAndSaveReport();
        }
        EsgReport report = esgReportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ESG Report not found with ID: " + id));

        if (!report.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to requested ESG Report");
        }
        return report;
    }

    public List<EsgReport> getReportHistory() {
        User user = getAuthenticatedUser();
        List<EsgReport> reports = esgReportRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (reports.isEmpty()) {
            // Auto-generate initial report if history is empty
            EsgReport initialReport = generateAndSaveReport();
            return List.of(initialReport);
        }
        return reports;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

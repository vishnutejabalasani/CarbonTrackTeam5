package com.carbontrack.controller;

import com.carbontrack.entity.Goal;
import com.carbontrack.entity.User;
import com.carbontrack.entity.VisionAnalysis;
import com.carbontrack.repository.ActivityRepository;
import com.carbontrack.repository.GoalRepository;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.service.GeminiService;
import com.carbontrack.service.VisionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
public class GeminiController {

    private final GeminiService geminiService;
    private final VisionService visionService;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final GoalRepository goalRepository;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/jpg"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    public GeminiController(GeminiService geminiService,
                            VisionService visionService,
                            UserRepository userRepository,
                            ActivityRepository activityRepository,
                            GoalRepository goalRepository) {
        this.geminiService = geminiService;
        this.visionService = visionService;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
        this.goalRepository = goalRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/parse-log")
    public ResponseEntity<List<Map<String, Object>>> parseLog(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<Map<String, Object>> activities = geminiService.parseNaturalLanguageLog(text);
        return ResponseEntity.ok(activities);
    }

    @PostMapping("/analyze-image")
    public ResponseEntity<?> analyzeImage(@RequestParam("image") MultipartFile image) {
        // Validate file presence
        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No image file provided."));
        }

        // Validate file type
        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Unsupported image type. Please upload PNG, JPEG, or WEBP."
            ));
        }

        // Validate file size
        if (image.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Image file exceeds the maximum allowed size of 10MB."
            ));
        }

        try {
            User user = getAuthenticatedUser();
            byte[] imageBytes = image.getBytes();
            String mimeType = contentType.toLowerCase();
            String fileName = image.getOriginalFilename();

            VisionAnalysis analysis = visionService.analyzeImage(user, imageBytes, mimeType, fileName);

            // Map response fields exactly to user requirements
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("analysisId", analysis.getId());
            response.put("imageUrl", analysis.getImageName()); // maps to stored filename path
            response.put("summary", analysis.getSummary());
            response.put("activities", analysis.getDetectedActivities());
            response.put("carbonBreakdown", analysis.getCarbonBreakdown());
            response.put("totalEmission", analysis.getTotalEstimatedKgCO2e());
            response.put("recommendations", analysis.getRecommendations());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("AI Vision upload error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to analyze image. " + e.getMessage()
            ));
        }
    }

    @GetMapping("/forecast")
    public ResponseEntity<List<Map<String, Object>>> getForecast() {
        User user = getAuthenticatedUser();
        LocalDate start = LocalDate.now().minusDays(7);
        LocalDate end = LocalDate.now();
        List<Object[]> dailySum = activityRepository.aggregateEmissionsByDate(user, start, end);
        List<Map<String, Object>> forecast = geminiService.generateForecast(dailySum);
        return ResponseEntity.ok(forecast);
    }

    @GetMapping("/forest-guardian")
    public ResponseEntity<Map<String, String>> getForestGuardian() {
        User user = getAuthenticatedUser();
        LocalDate start = LocalDate.now().minusDays(7);
        LocalDate end = LocalDate.now();
        Double sum = activityRepository.sumByUserAndDateRange(user, start, end);
        double emissions = sum != null ? sum : 0.0;

        List<Goal> activeGoals = goalRepository.findByUserAndStatus(user, "active");
        String goalTitle = activeGoals.isEmpty() ? null : activeGoals.get(0).getTitle();
        boolean onTrack = activeGoals.isEmpty() || (activeGoals.get(0).getOnTrack() != null && activeGoals.get(0).getOnTrack());

        String message = geminiService.getForestGuardianMessage(emissions, goalTitle, onTrack);
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chatWithGreenCoach(@RequestBody Map<String, String> request) {
        User user = getAuthenticatedUser();
        String message = request.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        LocalDate start = LocalDate.now().minusDays(7);
        LocalDate end = LocalDate.now();
        Double sum = activityRepository.sumByUserAndDateRange(user, start, end);
        double emissions = sum != null ? sum : 0.0;

        List<Goal> activeGoals = goalRepository.findByUserAndStatus(user, "active");
        String goalTitle = activeGoals.isEmpty() ? null : activeGoals.get(0).getTitle();

        String responseMessage = geminiService.chatWithGreenCoach(message, emissions, goalTitle);
        Map<String, String> response = new HashMap<>();
        response.put("reply", responseMessage);
        return ResponseEntity.ok(response);
    }
}

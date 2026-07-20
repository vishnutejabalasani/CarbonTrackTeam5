package com.carbontrack.controller;

import com.carbontrack.entity.User;
import com.carbontrack.entity.VisionAnalysis;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.service.VisionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/vision")
public class VisionController {

    private final VisionService visionService;
    private final UserRepository userRepository;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/jpg"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    public VisionController(VisionService visionService, UserRepository userRepository) {
        this.visionService = visionService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new SecurityException("User not authenticated.");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeImage(@RequestParam("image") MultipartFile image) {
        // Validate file presence
        if (image.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No image file provided."));
        }

        // Validate file type
        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Unsupported file type. Please upload PNG, JPEG, or WEBP images."
            ));
        }

        // Validate file size
        if (image.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Image file is too large. Maximum allowed size is 10 MB."
            ));
        }

        try {
            User user = getAuthenticatedUser();
            byte[] imageBytes = image.getBytes();
            String mimeType = contentType.toLowerCase();
            String fileName = image.getOriginalFilename();

            VisionAnalysis result = visionService.analyzeImage(user, imageBytes, mimeType, fileName);
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Vision analysis error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to analyze image. " + e.getMessage()
            ));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        try {
            User user = getAuthenticatedUser();
            List<VisionAnalysis> history = visionService.getUserHistory(user);
            return ResponseEntity.ok(history);
        } catch (SecurityException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAnalysis(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            User user = getAuthenticatedUser();
            VisionAnalysis updated = visionService.updateAnalysisEdits(id, user, updates);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}

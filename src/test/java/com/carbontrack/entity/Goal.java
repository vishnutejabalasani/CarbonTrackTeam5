package com.carbontrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank(message = "Goal title is required")
    @Column(nullable = false)
    private String title; // e.g., "Reduce transport emissions by 20%"

    @Column(name = "description")
    private String description;

    @NotNull(message = "Target reduction percentage is required")
    @Min(value = 1, message = "Target reduction must be at least 1%")
    @Max(value = 100, message = "Target reduction cannot exceed 100%")
    @Column(name = "target_reduction_percentage", nullable = false)
    private BigDecimal targetReductionPercentage;

    @Column(name = "category")
    private String category; // Optional: specific category like "transport", "all"

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "status")
    private String status; // "active", "completed", "abandoned", "paused"

    @Column(name = "progress_percentage")
    private BigDecimal progressPercentage; // Calculated: current reduction % achieved

    @Column(name = "on_track")
    private Boolean onTrack; // Whether user is on pace to meet goal

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        status = "active";
        onTrack = true;
        progressPercentage = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

package com.carbontrack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "vision_analyses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisionAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "image_name")
    private String imageName;

    @Column(name = "title")
    private String title;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Convert(converter = JsonConverter.class)
    @Column(name = "detected_activities", columnDefinition = "jsonb", nullable = false)
    private Object detectedActivities; // List<Map<String, Object>>

    @Convert(converter = JsonConverter.class)
    @Column(name = "carbon_breakdown", columnDefinition = "jsonb", nullable = false)
    private Object carbonBreakdown; // Map<String, Double>

    @Convert(converter = JsonConverter.class)
    @Column(name = "recommendations", columnDefinition = "jsonb", nullable = false)
    private Object recommendations; // List<String>

    @Column(name = "overall_confidence")
    private Double overallConfidence;

    @Column(name = "total_estimated_kg_co2e")
    private Double totalEstimatedKgCO2e;

    @Convert(converter = JsonConverter.class)
    @Column(name = "user_edits", columnDefinition = "jsonb")
    private Object userEdits; // Map<String, Object>

    @Column(name = "status")
    private String status; // "completed", "saved"

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "completed";
        }
    }
}

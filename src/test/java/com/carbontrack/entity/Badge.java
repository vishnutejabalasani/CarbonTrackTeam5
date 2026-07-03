package com.carbontrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Badge name is required")
    @Column(nullable = false)
    private String name; // e.g., "Carbon Conscious", "Zero Waste Week", "Green Champion"

    @Column(name = "description")
    private String description; // e.g., "Logged activities for 7 consecutive days"

    @Column(name = "criteria")
    private String criteria; // e.g., "total_co2_reduction_percentage > 25"

    @Column(name = "icon_url")
    private String iconUrl; // URL or path to badge icon/image

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

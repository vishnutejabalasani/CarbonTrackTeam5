package com.carbontrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "emission_factors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmissionFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category; // "transport", "electricity", "food", "shopping"

    @NotBlank(message = "Activity type is required")
    @Column(name = "activity_type", nullable = false)
    private String activityType; // e.g., "car_km_petrol", "kwh_coal", etc.

    @NotBlank(message = "Unit is required")
    @Column(nullable = false)
    private String unit; // "km", "kWh", "servings", "amount"

    @NotNull(message = "Emission value is required")
    @Positive(message = "Emission value must be greater than 0")
    @Column(name = "emission_value_kg_co2e", nullable = false)
    private Double emissionValueKgCO2e; // kg CO₂e per unit

    @Column(name = "source")
    private String source; // "IPCC", "EPA", "Custom"

    @Column(name = "description")
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active")
    private Boolean isActive;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

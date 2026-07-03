package com.carbontrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category; // "transport", "electricity", "food", "shopping"

    @NotBlank(message = "Activity type is required")
    @Column(name = "activity_type", nullable = false)
    private String activityType; // e.g., "car_km", "flight_hours", "kwh", "meal_type", "product_category"

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    @Column(nullable = false)
    private BigDecimal quantity;

    @NotBlank(message = "Unit is required")
    @Column(nullable = false)
    private String unit; // "km", "hours", "kWh", "servings", "amount"

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "calculated_emissions_kg_co2e")
    private BigDecimal calculatedEmissionsKgCO2e; // Result: quantity * emission_factor

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

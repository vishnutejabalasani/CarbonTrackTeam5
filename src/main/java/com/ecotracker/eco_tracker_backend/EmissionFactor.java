package com.ecotracker.eco_tracker_backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "emission_factors")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EmissionFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "activity_type", nullable = false, unique = true, length = 100)
    private String activityType;

    @Column(name = "co2e_per_unit", nullable = false, precision = 10, scale = 4)
    private BigDecimal co2ePerUnit;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
        updatedAt = ZonedDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}

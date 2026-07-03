package com.ecotracker.eco_tracker_backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(name = "activity_logs")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "activity_type", referencedColumnName = "activity_type", nullable = false)
    private EmissionFactor emissionFactor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "calculated_emissions", nullable = false, precision = 12, scale = 4)
    private BigDecimal calculatedEmissions;

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
        if (calculatedEmissions == null && quantity != null && emissionFactor != null) {
            calculatedEmissions = quantity.multiply(emissionFactor.getCo2ePerUnit());
        }
    }
}

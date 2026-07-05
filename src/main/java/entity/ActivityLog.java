package com.carbontrack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String category; // "transport", "electricity", "food", "shopping"

    @Column(nullable = false)
    private String activityType; // "car_km", "kwh", "meal_type_meat", etc.

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    private String unit; // "km", "kWh", "servings", "amount"

    @Column(nullable = false)
    private LocalDate logDate;

    @Column(nullable = false)
    private Double calculatedEmissionsKgCO2e; // The calculated CO2e

    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
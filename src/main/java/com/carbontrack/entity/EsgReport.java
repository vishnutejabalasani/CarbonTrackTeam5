package com.carbontrack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "esg_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EsgReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "report_title", nullable = false)
    private String reportTitle;

    @Column(name = "audit_date", nullable = false)
    private LocalDate auditDate;

    @Column(name = "generated_time", nullable = false)
    private LocalDateTime generatedTime;

    @Column(name = "overall_esg_score", nullable = false)
    private Double overallEsgScore;

    @Column(name = "total_carbon_emissions", nullable = false)
    private Double totalCarbonEmissions;

    @Column(name = "weekly_emissions", nullable = false)
    private Double weeklyEmissions;

    @Column(name = "monthly_emissions", nullable = false)
    private Double monthlyEmissions;

    @Convert(converter = JsonConverter.class)
    @Column(name = "category_emissions_json", columnDefinition = "TEXT")
    private Object categoryEmissions;

    @Convert(converter = JsonConverter.class)
    @Column(name = "social_employee_metrics_json", columnDefinition = "TEXT")
    private Object socialEmployeeMetrics;

    @Convert(converter = JsonConverter.class)
    @Column(name = "social_community_metrics_json", columnDefinition = "TEXT")
    private Object socialCommunityMetrics;

    @Convert(converter = JsonConverter.class)
    @Column(name = "governance_metrics_json", columnDefinition = "TEXT")
    private Object governanceMetrics;

    @Column(name = "audit_score", nullable = false)
    private Double auditScore;

    @Convert(converter = JsonConverter.class)
    @Column(name = "recommendations_json", columnDefinition = "TEXT")
    private Object recommendations;

    @Convert(converter = JsonConverter.class)
    @Column(name = "charts_summary_json", columnDefinition = "TEXT")
    private Object chartsSummary;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (generatedTime == null) {
            generatedTime = LocalDateTime.now();
        }
        if (auditDate == null) {
            auditDate = LocalDate.now();
        }
        if (companyName == null) {
            companyName = "CarbonTrack Enterprise";
        }
        if (reportTitle == null) {
            reportTitle = "Annual ESG Performance & Sustainability Audit";
        }
    }
}

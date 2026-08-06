package com.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalResponse {
    private Long id;
    private String title;
    private String description;
    private Double targetReductionPercent;
    private String timeframe;
    private Double progressPercent;
    private Boolean onTrack;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String alertMessage;

    // Detailed metrics for Goal Tracking Widget
    private Double baselineEmissions;
    private Double currentEmissions;
    private Double targetEmissions;
    private Double dailyAllowedEmissions;
    private Double recentDailyAvgEmissions;
    private Double dailyReductionRequired;
    private Long remainingDays;
    private Double projectedTotalEmissions;
    private List<GoalTrajectoryPoint> trajectoryData;
}

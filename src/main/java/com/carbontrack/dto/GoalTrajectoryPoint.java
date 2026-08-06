package com.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalTrajectoryPoint {
    private LocalDate date;
    private String dayLabel;
    private Double actualEmissions;
    private Double cumulativeActual;
    private Double targetLimit;
    private Double projectedEmissions;
    private Boolean isFuture;
}

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
}

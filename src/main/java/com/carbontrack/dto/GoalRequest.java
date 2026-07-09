package com.carbontrack.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GoalRequest {

    @NotNull(message = "Target reduction percentage is required")
    @Min(value = 1, message = "Target reduction must be at least 1%")
    @Max(value = 100, message = "Target reduction cannot exceed 100%")
    private Double targetReductionPercent;

    @NotBlank(message = "Timeframe is required")
    private String timeframe; // "weekly" or "monthly"
}

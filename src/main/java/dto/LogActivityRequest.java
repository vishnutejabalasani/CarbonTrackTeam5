package com.carbontrack.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LogActivityRequest {
    private String category;
    private String activityType;
    private Double quantity;
    private String unit;
    private LocalDate logDate;
}
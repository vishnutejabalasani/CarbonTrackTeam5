package com.carbontrack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Preferred unit is required")
    private String preferredUnit; // "metric" or "imperial"

    @NotBlank(message = "Goal visibility is required")
    private String goalVisibility; // "public", "private", "friends"
}

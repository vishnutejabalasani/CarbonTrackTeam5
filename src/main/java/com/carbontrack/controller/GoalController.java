package com.carbontrack.controller;

import com.carbontrack.dto.GoalRequest;
import com.carbontrack.dto.GoalResponse;
import com.carbontrack.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public ResponseEntity<GoalResponse> setGoal(@Valid @RequestBody GoalRequest request) {
        return ResponseEntity.ok(goalService.setGoal(request));
    }

    @GetMapping("/current")
    public ResponseEntity<GoalResponse> getCurrentGoal() {
        GoalResponse current = goalService.getCurrentGoal();
        if (current == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(current);
    }

    @GetMapping("/history")
    public ResponseEntity<List<GoalResponse>> getGoalHistory() {
        return ResponseEntity.ok(goalService.getGoalHistory());
    }
}

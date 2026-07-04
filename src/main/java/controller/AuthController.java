package com.carbontrack.controller;

import com.carbontrack.dto.AuthResponse;
import com.carbontrack.dto.RegisterRequest;
import com.carbontrack.service.AuthService;
import org.springframework.web.bind.annotation.*;
import com.carbontrack.dto.LoginRequest;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

}
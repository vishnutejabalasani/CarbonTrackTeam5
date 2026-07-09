package com.carbontrack.service;

import com.carbontrack.dto.RegisterRequest;
import com.carbontrack.dto.LoginRequest;
import com.carbontrack.dto.GoogleLoginRequest;
import com.carbontrack.dto.AuthResponse;
import com.carbontrack.entity.User;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.UUID;
@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(null, "Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token, "User Registered Successfully");
    }
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token, "Login Successful");
    }

    public AuthResponse googleLogin(GoogleLoginRequest request) {
        String idToken = request.getIdToken();

        // Developer bypass for local testing without OAuth Client ID
        if (idToken != null && idToken.startsWith("dev-token-")) {
            String email = idToken.substring("dev-token-".length());
            String initialName = email.split("@")[0];
            if (initialName.length() > 0) {
                initialName = Character.toUpperCase(initialName.charAt(0)) + initialName.substring(1);
            }
            final String name = initialName;

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                String username = email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 5);
                User newUser = User.builder()
                        .email(email)
                        .username(username)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .fullName(name)
                        .preferredUnit("metric")
                        .goalVisibility("private")
                        .build();
                return userRepository.save(newUser);
            });

            String token = jwtService.generateToken(user.getEmail());
            return new AuthResponse(token, "Google Login Successful");
        }

        String googleUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;

        RestTemplate restTemplate = new RestTemplate();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(googleUrl, Map.class);
            if (response == null || response.containsKey("error_description")) {
                return new AuthResponse(null, "Invalid Google token");
            }

            String email = (String) response.get("email");
            String name = (String) response.get("name");

            if (email == null) {
                return new AuthResponse(null, "Email not found in Google token");
            }

            // Check if user exists by email
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                // Register user
                String username = email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 5);
                User newUser = User.builder()
                        .email(email)
                        .username(username)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .fullName(name)
                        .preferredUnit("metric")
                        .goalVisibility("private")
                        .build();
                return userRepository.save(newUser);
            });

            String token = jwtService.generateToken(user.getEmail());
            return new AuthResponse(token, "Google Login Successful");

        } catch (Exception e) {
            return new AuthResponse(null, "Google token verification failed: " + e.getMessage());
        }
    }

}
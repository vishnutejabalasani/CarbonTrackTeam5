package com.carbontrack.service;

import com.carbontrack.dto.RegisterRequest;
import com.carbontrack.dto.LoginRequest;
import com.carbontrack.dto.GoogleLoginRequest;
import com.carbontrack.dto.AuthResponse;
import com.carbontrack.entity.User;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @org.springframework.beans.factory.annotation.Value("${app.auth.allow-dev-bypass:false}")
    private boolean allowDevBypass;

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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        String username = request.getUsername();
        if (username == null || username.isBlank()) {
            username = request.getEmail().split("@")[0];
        }
        if (userRepository.existsByUsername(username)) {
            username = username + "_" + UUID.randomUUID().toString().substring(0, 5);
        }

        User user = User.builder()
                .username(username)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .preferredUnit("metric")
                .goalVisibility("private")
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token, "User Registered Successfully");
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token, "Login Successful");
    }

    public AuthResponse googleLogin(GoogleLoginRequest request) {
        String idToken = request.getIdToken();

        // Developer bypass for local testing without OAuth Client ID
        if (idToken != null && idToken.startsWith("dev-token-")) {
            if (!allowDevBypass) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Developer token bypass is disabled in this environment");
            }
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
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Google token");
            }

            String email = (String) response.get("email");
            String name = (String) response.get("name");

            if (email == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email not found in Google token");
            }

            // Check if user exists by email
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

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google token verification failed: " + e.getMessage());
        }
    }

}
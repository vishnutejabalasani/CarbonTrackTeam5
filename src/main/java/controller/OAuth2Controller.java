package com.carbontrack.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OAuth2Controller {

    @GetMapping("/loginSuccess")
    public String loginSuccess() {
        return "Google Login Successful!";
    }
}
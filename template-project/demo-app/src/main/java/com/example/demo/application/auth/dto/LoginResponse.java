package com.example.demo.application.auth.dto;

import lombok.Data;

import java.util.List;

@Data
public class LoginResponse {
    private String token;
    private String username;
    private List<String> roles;
    private String message;
}


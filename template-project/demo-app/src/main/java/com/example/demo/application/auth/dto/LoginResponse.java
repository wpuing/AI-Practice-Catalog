package com.example.demo.application.auth.dto;

import com.example.demo.domain.menu.entity.Menu;
import lombok.Data;

import java.util.List;

@Data
public class LoginResponse {
    private String token;
    private String username;
    private List<String> roles;
    private List<Menu> menus;
    private String message;
}


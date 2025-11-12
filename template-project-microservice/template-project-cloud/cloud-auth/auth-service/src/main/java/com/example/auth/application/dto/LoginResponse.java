package com.example.auth.application.dto;

import lombok.Data;

/**
 * 登录响应
 */
@Data
public class LoginResponse {
    /**
     * Token
     */
    private String token;

    /**
     * 用户ID
     */
    private String userId;

    /**
     * 用户名
     */
    private String username;
}


package com.example.auth.interfaces.rest;

import com.example.auth.application.dto.LoginRequest;
import com.example.auth.application.dto.LoginResponse;
import com.example.auth.application.service.AuthService;
import com.example.core.common.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success(response);
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public Result<Void> logout(@RequestHeader("X-User-Id") String userId) {
        authService.logout(userId);
        return Result.success();
    }

    /**
     * 验证 Token
     */
    @GetMapping("/validate")
    public Result<Boolean> validateToken(@RequestHeader("Authorization") String token) {
        boolean valid = authService.validateToken(token.replace("Bearer ", ""));
        return Result.success(valid);
    }
}


package com.example.auth.application.service;

import com.example.auth.application.dto.LoginRequest;
import com.example.auth.application.dto.LoginResponse;
import com.example.auth.domain.entity.AuthUser;
import com.example.auth.domain.repository.AuthUserRepository;
import com.example.core.common.exception.BusinessException;
import com.example.core.common.result.ResultCode;
import com.example.core.security.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * 认证服务
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * 用户登录
     */
    public LoginResponse login(LoginRequest request) {
        // 查询用户
        AuthUser user = authUserRepository.findByUsername(request.getUsername());
        if (user == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "用户名或密码错误");
        }

        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "用户名或密码错误");
        }

        // 检查用户状态
        if (user.getStatus() == 0) {
            throw new BusinessException(ResultCode.FORBIDDEN, "用户已被禁用");
        }

        // 生成 Token
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("username", user.getUsername());
        String token = jwtUtil.generateToken(user.getId(), claims);

        // 存储 Token 到 Redis
        String tokenKey = "token:" + user.getId();
        redisTemplate.opsForValue().set(tokenKey, token, 24, TimeUnit.HOURS);

        // 构建响应
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        return response;
    }

    /**
     * 用户登出
     */
    public void logout(String userId) {
        String tokenKey = "token:" + userId;
        redisTemplate.delete(tokenKey);
    }

    /**
     * 验证 Token
     */
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }
}


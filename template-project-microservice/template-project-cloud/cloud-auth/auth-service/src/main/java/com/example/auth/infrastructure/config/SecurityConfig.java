package com.example.auth.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 安全配置
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 禁用 CSRF 保护（API 服务通常不需要 CSRF）
            .csrf(csrf -> csrf.disable())
            // 禁用 HTTP Basic Authentication
            .httpBasic(httpBasic -> httpBasic.disable())
            // 禁用表单登录
            .formLogin(formLogin -> formLogin.disable())
            // 使用无状态会话（JWT 认证）
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 配置请求授权
            .authorizeHttpRequests(auth -> auth
                // 允许所有 /api/auth/** 路径的请求（登录、登出等）
                .requestMatchers("/api/auth/**").permitAll()
                // 允许健康检查端点
                .requestMatchers("/actuator/**").permitAll()
                // 其他请求需要认证
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
}


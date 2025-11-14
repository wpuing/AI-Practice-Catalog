package com.example.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Gateway 安全配置
 * 禁用 CSRF 和 HTTP Basic Authentication，因为 Gateway 作为 API 网关，认证和授权由各个微服务处理
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            // 禁用 CSRF 保护（API 网关通常不需要 CSRF）
            .csrf(csrf -> csrf.disable())
            // 禁用 HTTP Basic Authentication（避免浏览器弹出基本认证框）
            .httpBasic(httpBasic -> httpBasic.disable())
            // 禁用表单登录
            .formLogin(formLogin -> formLogin.disable())
            // 允许所有请求通过（认证和授权由各个微服务处理）
            .authorizeExchange(exchanges -> exchanges
                .anyExchange().permitAll()
            );
        
        return http.build();
    }
}


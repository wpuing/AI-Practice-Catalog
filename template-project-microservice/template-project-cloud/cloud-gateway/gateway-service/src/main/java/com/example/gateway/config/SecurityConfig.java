package com.example.gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Gateway 安全配置
 * 禁用 CSRF 和 HTTP Basic Authentication，因为 Gateway 作为 API 网关，认证和授权由各个微服务处理
 */
@Slf4j
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    @Order(-1) // 设置高优先级，确保在其他Security配置之前生效
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        log.info("Configuring Gateway SecurityWebFilterChain - allowing all requests");
        
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
        
        SecurityWebFilterChain chain = http.build();
        log.info("Gateway SecurityWebFilterChain configured successfully");
        return chain;
    }
}

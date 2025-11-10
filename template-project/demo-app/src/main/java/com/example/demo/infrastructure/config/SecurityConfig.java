package com.example.demo.infrastructure.config;

import com.example.demo.domain.security.entity.SecurityPermission;
import com.example.demo.domain.security.entity.SecurityWhitelist;
import com.example.demo.infrastructure.security.JwtAuthenticationFilter;
import com.example.demo.application.role.SecurityConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private com.example.demo.application.user.impl.UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private SecurityConfigService securityConfigService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * 配置 HttpFirewall，允许更多的字符和格式，避免 JSON 请求体被误判为参数
     */
    @Bean
    public HttpFirewall httpFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        // 允许 URL 中包含更多字符
        firewall.setAllowUrlEncodedSlash(true);
        firewall.setAllowUrlEncodedPercent(true);
        firewall.setAllowUrlEncodedPeriod(true);
        firewall.setAllowBackSlash(true);
        firewall.setAllowSemicolon(true);
        // 允许未规范化的请求（这对于某些代理服务器场景很重要）
        firewall.setAllowUrlEncodedDoubleSlash(true);
        // 允许所有参数名（包括包含特殊字符的参数名，避免 JSON 请求体被误判）
        firewall.setAllowedParameterNames(parameterName -> true);
        // 允许所有参数值
        firewall.setAllowedParameterValues(parameterValue -> true);
        return firewall;
    }

    /**
     * 配置 WebSecurity，应用自定义的防火墙
     */
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.httpFirewall(httpFirewall());
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 禁用默认的安全配置
            .httpBasic(basic -> basic.disable())
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {}) // 启用CORS，使用WebConfig中的配置
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> {
                // 从数据库加载白名单配置
                List<SecurityWhitelist> whitelists = securityConfigService.getAllEnabledWhitelist();
                if (!whitelists.isEmpty()) {
                    log.info(String.format("配置白名单，共 %d 条规则", whitelists.size()));
                    AntPathRequestMatcher[] whitelistMatchers = whitelists.stream()
                            .filter(w -> w.getPathPattern() != null && !w.getPathPattern().trim().isEmpty())
                            .map(w -> {
                                String method = w.getHttpMethod();
                                if (method != null && !method.trim().isEmpty()) {
                                    return new AntPathRequestMatcher(w.getPathPattern().trim(), method.trim().toUpperCase());
                                } else {
                                    return new AntPathRequestMatcher(w.getPathPattern().trim());
                                }
                            })
                            .collect(Collectors.toList())
                            .toArray(new AntPathRequestMatcher[0]);
                    
                    if (whitelistMatchers.length > 0) {
                        auth.requestMatchers(whitelistMatchers).permitAll();
                    }
                } else {
                    // 如果没有数据库配置，使用默认白名单（兜底）
                    log.warn("未找到白名单配置，使用默认白名单");
                    auth.requestMatchers(
                        new AntPathRequestMatcher("/api/auth/login"),
                        new AntPathRequestMatcher("/api/auth/register"),
                        new AntPathRequestMatcher("/error"),
                        new AntPathRequestMatcher("/favicon.ico")
                    ).permitAll();
                }

                // 从数据库加载权限配置
                List<SecurityPermission> permissions = securityConfigService.getAllEnabledPermissions();
                if (!permissions.isEmpty()) {
                    log.info(String.format("配置权限规则，共 %d 条规则", permissions.size()));
                    for (SecurityPermission permission : permissions) {
                        if (permission.getPathPattern() == null || permission.getPathPattern().trim().isEmpty()) {
                            continue;
                        }
                        
                        AntPathRequestMatcher matcher;
                        String method = permission.getHttpMethod();
                        if (method != null && !method.trim().isEmpty()) {
                            matcher = new AntPathRequestMatcher(permission.getPathPattern().trim(), method.trim().toUpperCase());
                        } else {
                            matcher = new AntPathRequestMatcher(permission.getPathPattern().trim());
                        }

                        String requiredRoles = permission.getRequiredRoles();
                        if (requiredRoles != null && !requiredRoles.trim().isEmpty()) {
                            String[] roles = requiredRoles.split(",");
                            if (roles.length == 1) {
                                auth.requestMatchers(matcher).hasRole(roles[0].trim());
                            } else {
                                String[] trimmedRoles = new String[roles.length];
                                for (int i = 0; i < roles.length; i++) {
                                    trimmedRoles[i] = roles[i].trim();
                                }
                                auth.requestMatchers(matcher).hasAnyRole(trimmedRoles);
                            }
                        } else {
                            auth.requestMatchers(matcher).authenticated();
                        }
                    }
                } else {
                    // 如果没有数据库配置，使用默认权限规则（兜底）
                    log.warn("未找到权限配置，使用默认权限规则");
                    auth.requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN");
                    auth.requestMatchers("/api/users/**").hasAnyRole("USER", "ADMIN", "SUPER_ADMIN");
                }

                // 其他接口需要认证
                auth.anyRequest().authenticated();
            })
            // 配置认证提供者
            .authenticationProvider(authenticationProvider())
            // 添加JWT过滤器
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
}


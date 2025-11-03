package com.example.demo.infrastructure.security;

import com.example.demo.common.result.Result;
import com.example.demo.common.constants.LogMessages;
import com.example.demo.domain.security.entity.TokenInfo;
import com.example.demo.common.enums.StatusCode;
import com.example.demo.infrastructure.cache.TokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private TokenService tokenService;

    private final ObjectMapper objectMapper;

    public JwtAuthenticationFilter() {
        this.objectMapper = new ObjectMapper();
        // 配置ObjectMapper支持Java 8时间类型
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Autowired
    private com.example.demo.application.role.SecurityConfigService securityConfigService;

    /**
     * 获取白名单路径（从数据库加载）
     */
    private String[] getWhitelistPaths() {
        try {
            List<com.example.demo.domain.security.entity.SecurityWhitelist> whitelists = securityConfigService.getAllEnabledWhitelist();
            if (!whitelists.isEmpty()) {
                return whitelists.stream()
                        .map(com.example.demo.domain.security.entity.SecurityWhitelist::getPathPattern)
                        .filter(path -> path != null && !path.trim().isEmpty())
                        .toArray(String[]::new);
            }
        } catch (Exception e) {
            logger.warn(String.format("加载白名单失败，使用默认白名单: %s", e.getMessage()));
        }
        
        // 默认白名单（兜底）
        return new String[]{
            "/api/auth/login",
            "/api/auth/register",
            "/api/public",
            "/swagger-ui",
            "/v2/api-docs",
            "/v3/api-docs",
            "/actuator"
        };
    }

    /**
     * 重写此方法，在白名单路径上完全跳过过滤器
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        
        // 移除context path
        if (contextPath != null && !contextPath.isEmpty() && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }
        
        // 检查是否在白名单中（支持Ant风格匹配）
        String[] whitelistPaths = getWhitelistPaths();
        for (String whitelistPath : whitelistPaths) {
            if (matchesAntPattern(path, whitelistPath)) {
                logger.debug(String.format("跳过JWT过滤器，白名单路径: %s (匹配模式: %s)", path, whitelistPath));
                return true;
            }
        }
        return false;
    }

    /**
     * 简单的Ant风格路径匹配
     */
    private boolean matchesAntPattern(String path, String pattern) {
        if (pattern == null || pattern.isEmpty()) {
            return false;
        }
        
        // 如果模式以 ** 结尾，表示匹配所有子路径
        if (pattern.endsWith("/**")) {
            String prefix = pattern.substring(0, pattern.length() - 3);
            return path.startsWith(prefix);
        }
        
        // 如果模式以 * 结尾，表示匹配单层路径
        if (pattern.endsWith("*")) {
            String prefix = pattern.substring(0, pattern.length() - 1);
            int nextSlash = path.indexOf('/', prefix.length());
            return path.startsWith(prefix) && (nextSlash == -1 || nextSlash == path.length());
        }
        
        // 完全匹配
        return path.equals(pattern);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) 
            throws ServletException, IOException {
        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        
        logger.debug(String.format("处理JWT验证，路径: %s, %s", method, requestPath));

        try {
            // 如果SecurityContext中已经有认证信息（例如测试中使用@WithMockUser），则跳过JWT验证
            if (SecurityContextHolder.getContext().getAuthentication() != null 
                    && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
                logger.debug("SecurityContext已存在认证信息，跳过JWT验证");
                filterChain.doFilter(request, response);
                return;
            }

            String token = getTokenFromRequest(request);

            // 只有在存在token时才进行验证
            if (StringUtils.hasText(token)) {
                try {
                    // 从Redis获取Token信息
                    TokenInfo tokenInfo = tokenService.getTokenInfo(token);
                    
                    if (tokenInfo != null) {
                        // 构建用户权限列表
                        List<GrantedAuthority> authorities = new ArrayList<>();
                        if (tokenInfo.getRoles() != null) {
                            for (String role : tokenInfo.getRoles()) {
                                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                            }
                        }

                        // 创建认证对象（不需要密码，因为已经通过token验证）
                        UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(
                                        tokenInfo.getUsername(), null, authorities);
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        
                        logger.debug(String.format(LogMessages.Token.VERIFY_SUCCESS, 
                            tokenInfo.getUsername(), token));
                    } else {
                        // Token无效或已过期，返回明确的错误提示
                        logger.warn(String.format(LogMessages.Token.INVALID_OR_EXPIRED, token));
                        writeTokenExpiredResponse(response);
                        return;
                    }
                } catch (Exception e) {
                    logger.warn(String.format(LogMessages.Token.VERIFY_FAILED, e.getMessage()), e);
                    // Token验证失败，返回明确的错误提示
                    writeTokenExpiredResponse(response);
                    return;
                }
            }
        } catch (Exception e) {
            logger.error(String.format("无法设置用户认证: %s", e.getMessage()), e);
        }

        filterChain.doFilter(request, response);
    }


    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * 写入Token失效的错误响应
     */
    private void writeTokenExpiredResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        
        Result<String> result = Result.error(
            StatusCode.TOKEN_EXPIRED.getCode(), 
            StatusCode.TOKEN_EXPIRED.getMessage());
        String json = objectMapper.writeValueAsString(result);
        response.getWriter().write(json);
        response.getWriter().flush();
    }
}


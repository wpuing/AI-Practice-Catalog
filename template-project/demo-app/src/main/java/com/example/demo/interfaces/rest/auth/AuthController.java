package com.example.demo.interfaces.rest.auth;

import com.example.demo.common.result.Result;
import com.example.demo.common.constants.LogMessages;
import com.example.demo.application.auth.dto.LoginRequest;
import com.example.demo.application.auth.dto.LoginResponse;
import com.example.demo.domain.user.entity.User;
import com.example.demo.common.enums.StatusCode;
import com.example.demo.infrastructure.cache.RoleCacheService;
import com.example.demo.infrastructure.cache.TokenService;
import com.example.demo.application.user.UserService;
import com.example.demo.infrastructure.util.BrowserIdentifier;
import com.example.demo.infrastructure.util.IpUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private RoleCacheService roleCacheService;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private BrowserIdentifier browserIdentifier;

    @Autowired
    private IpUtil ipUtil;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody(required = false) LoginRequest loginRequest, HttpServletRequest request) {
        // 检查请求体是否为空
        if (loginRequest == null) {
            return Result.error(StatusCode.REQUEST_BODY_EMPTY.getCode(), StatusCode.REQUEST_BODY_EMPTY.getMessage());
        }
        
        // 检查用户名和密码是否为空
        if (loginRequest.getUsername() == null || loginRequest.getUsername().trim().isEmpty()) {
            return Result.error(StatusCode.USERNAME_EMPTY.getCode(), StatusCode.USERNAME_EMPTY.getMessage());
        }
        
        if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
            return Result.error(StatusCode.PASSWORD_EMPTY.getCode(), StatusCode.PASSWORD_EMPTY.getMessage());
        }

        String username = loginRequest.getUsername().trim();
        String password = loginRequest.getPassword();

        log.info(String.format(LogMessages.Auth.LOGIN_REQUEST, username));

        try {
            // 先查询用户是否存在
            User user = userService.getOne(
                    new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                            .eq("username", username));
            
            if (user == null) {
                log.warn(String.format(LogMessages.Auth.LOGIN_USER_NOT_FOUND, username));
                return Result.error(StatusCode.LOGIN_FAILED.getCode(), StatusCode.LOGIN_FAILED.getMessage());
            }

            // 调试：验证密码是否匹配
            String dbPassword = user.getPassword();
            log.info(String.format(LogMessages.Auth.PASSWORD_VERIFY_DETAIL, 
                username, password.length(), dbPassword != null ? dbPassword.length() : 0));
            log.info(String.format(LogMessages.Auth.PASSWORD_PREFIX, 
                dbPassword != null && dbPassword.length() > 10 ? dbPassword.substring(0, 10) : dbPassword));
            log.info(String.format(LogMessages.Auth.PASSWORD_FULL, dbPassword));
            
            boolean passwordMatches = passwordEncoder.matches(password, dbPassword);
            log.info(String.format(LogMessages.Auth.PASSWORD_VERIFY_RESULT, passwordMatches));
            
            // 如果密码不匹配，尝试去除前后空格再验证
            if (!passwordMatches && dbPassword != null) {
                String trimmedPassword = dbPassword.trim();
                if (!trimmedPassword.equals(dbPassword)) {
                    log.info(LogMessages.Auth.PASSWORD_TRIM_DETECTED);
                    passwordMatches = passwordEncoder.matches(password, trimmedPassword);
                    if (passwordMatches) {
                        // 更新数据库中的密码（去除空格）
                        user.setPassword(trimmedPassword);
                        userService.updateById(user);
                        log.info(LogMessages.Auth.PASSWORD_TRIM_UPDATED);
                    }
                }
            }
            
            if (!passwordMatches) {
                log.warn(String.format(LogMessages.Auth.PASSWORD_VERIFY_FAILED, username));
                // 额外调试：尝试直接比较（不应该匹配，但可以查看）
                log.warn(String.format(LogMessages.Auth.PASSWORD_COMPARISON, password, dbPassword));
                return Result.error(StatusCode.LOGIN_FAILED.getCode(), StatusCode.LOGIN_FAILED.getMessage());
            }

            // 使用 AuthenticationManager 进行认证
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // 从Redis缓存获取用户角色（优先从缓存获取）
            List<String> roleCodes = roleCacheService.getUserRoles(user.getId());

            // 生成32位随机Token
            String token = tokenService.generateToken();
            
            // 生成浏览器ID
            String browserId = browserIdentifier.generateBrowserId(request);
            
            // 获取客户端IP地址
            String clientIp = ipUtil.getClientIp(request);
            
            // 将Token和用户信息（包括角色权限）存储到Redis中
            // 注意：这里暂时不存储权限列表，只存储角色（权限可以后续扩展）
            // 传递浏览器ID和IP以实现单浏览器单用户限制和IP限制
            tokenService.saveToken(token, userDetails.getUsername(), user.getId(), roleCodes, List.of(), browserId, clientIp);

            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setUsername(userDetails.getUsername());
            response.setRoles(roleCodes);
            response.setMessage(StatusCode.LOGIN_SUCCESS.getMessage());

            log.info(String.format(LogMessages.Auth.LOGIN_SUCCESS, username, token));
            return Result.success(StatusCode.LOGIN_SUCCESS.getMessage(), response);

        } catch (UsernameNotFoundException e) {
            log.warn(String.format(LogMessages.Auth.LOGIN_USER_NOT_FOUND, username));
            return Result.error(StatusCode.LOGIN_FAILED.getCode(), StatusCode.LOGIN_FAILED.getMessage());
        } catch (BadCredentialsException e) {
            log.warn(String.format(LogMessages.Auth.LOGIN_PASSWORD_ERROR, username));
            return Result.error(StatusCode.LOGIN_FAILED.getCode(), StatusCode.LOGIN_FAILED.getMessage());
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.warn(String.format(LogMessages.Auth.LOGIN_AUTH_ERROR, username, e.getMessage()));
            return Result.error(StatusCode.LOGIN_FAILED.getCode(), StatusCode.LOGIN_FAILED.getMessage());
        } catch (Exception e) {
            log.error(String.format(LogMessages.Auth.LOGIN_EXCEPTION, e.getMessage()), e);
            return Result.error(StatusCode.LOGIN_ERROR.getCode(), StatusCode.LOGIN_ERROR.getMessage() + ": " + e.getMessage());
        }
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<User> register(@RequestBody User user) {
        // 检查用户名是否为空
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return Result.error(StatusCode.USERNAME_EMPTY.getCode(), StatusCode.USERNAME_EMPTY.getMessage());
        }

        // 检查密码是否为空
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return Result.error(StatusCode.PASSWORD_EMPTY.getCode(), StatusCode.PASSWORD_EMPTY.getMessage());
        }

        // 检查用户名是否已存在
        User existingUser = userService.getOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .eq("username", user.getUsername().trim()));
        if (existingUser != null) {
            return Result.error(StatusCode.USERNAME_EXISTS.getCode(), StatusCode.USERNAME_EXISTS.getMessage());
        }

        // 加密密码
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setUsername(user.getUsername().trim());
        boolean saved = userService.save(user);

        if (saved) {
            // 清除密码后再返回
            user.setPassword(null);
            return Result.success(StatusCode.REGISTER_SUCCESS.getMessage(), user);
        } else {
            return Result.error(StatusCode.REGISTER_FAILED.getCode(), StatusCode.REGISTER_FAILED.getMessage());
        }
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public Result<Map<String, Object>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return Result.error(StatusCode.UNAUTHORIZED.getCode(), StatusCode.UNAUTHORIZED.getMessage());
        }

        String username = authentication.getName();
        User user = userService.getOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .eq("username", username));
        
        if (user == null) {
            return Result.error(StatusCode.USER_NOT_FOUND.getCode(), StatusCode.USER_NOT_FOUND.getMessage());
        }

        // 从Redis缓存获取用户角色（优先从缓存获取）
        List<String> roleCodes = roleCacheService.getUserRoles(user.getId());

        // 清除敏感信息
        user.setPassword(null);

        Map<String, Object> data = new HashMap<>();
        data.put("user", user);
        data.put("roles", roleCodes);

        return Result.success(data);
    }

    /**
     * 刷新Token（30分钟内无刷新则失效）
     */
    @PostMapping("/refresh")
    public Result<Map<String, Object>> refreshToken(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Result.error(StatusCode.TOKEN_MISSING.getCode(), StatusCode.TOKEN_MISSING.getMessage());
        }

        String token = authorization.substring(7);
        
        boolean refreshed = tokenService.refreshToken(token);
        if (!refreshed) {
            return Result.error(StatusCode.TOKEN_INVALID.getCode(), StatusCode.TOKEN_INVALID.getMessage());
        }

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("message", StatusCode.TOKEN_REFRESH_SUCCESS.getMessage());
        
        return Result.success(StatusCode.TOKEN_REFRESH_SUCCESS.getMessage(), data);
    }

    /**
     * 退出登录（删除Token及所有相关登录信息）
     */
    @PostMapping("/logout")
    public Result<String> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Result.error(StatusCode.TOKEN_MISSING.getCode(), StatusCode.TOKEN_MISSING.getMessage());
        }

        String token = authorization.substring(7);
        
        // 获取token信息，以便获取用户ID和用户名
        com.example.demo.domain.security.entity.TokenInfo tokenInfo = tokenService.getTokenInfo(token);
        if (tokenInfo != null) {
            // 删除该用户的所有登录信息（包括所有浏览器、IP等相关的token）
            tokenService.deleteAllUserTokens(tokenInfo.getUserId(), tokenInfo.getUsername());
            log.info(String.format(LogMessages.Auth.LOGOUT_SUCCESS, 
                tokenInfo.getUsername(), tokenInfo.getUserId()));
        } else {
            // 如果token已失效，也尝试删除（可能其他映射还存在）
            tokenService.deleteToken(token);
            log.warn(LogMessages.Auth.LOGOUT_TOKEN_EXPIRED);
        }
        
        return Result.success(StatusCode.LOGOUT_SUCCESS.getMessage());
    }
}


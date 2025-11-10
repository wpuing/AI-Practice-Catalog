package com.example.demo.interfaces.rest.system;

import com.example.demo.common.result.Result;
import com.example.demo.domain.security.entity.TokenInfo;
import com.example.demo.infrastructure.cache.TokenService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.time.LocalDateTime;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Redis管理控制器
 * 提供详细的Redis操作接口（需要管理员权限）
 */
@Slf4j
@RestController
@RequestMapping("/api/redis")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class RedisController {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private TokenService tokenService;

    /**
     * 获取Token信息
     */
    @GetMapping("/token/{token}")
    public Result<TokenInfo> getTokenInfo(@PathVariable String token) {
        TokenInfo tokenInfo = tokenService.getTokenInfo(token);
        if (tokenInfo == null) {
            return Result.error(404, "Token不存在或已过期");
        }
        return Result.success(tokenInfo);
    }

    /**
     * 检查Token是否有效
     */
    @GetMapping("/token/{token}/valid")
    public Result<Map<String, Object>> checkTokenValid(@PathVariable String token) {
        boolean valid = tokenService.isTokenValid(token);
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("valid", valid);
        return Result.success(data);
    }

    /**
     * 刷新指定Token
     */
    @PostMapping("/token/{token}/refresh")
    public Result<Map<String, Object>> refreshToken(@PathVariable String token) {
        boolean refreshed = tokenService.refreshToken(token);
        if (!refreshed) {
            return Result.error(400, "Token无效或已过期，无法刷新");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("message", "Token刷新成功");
        return Result.success("Token刷新成功", data);
    }

    /**
     * 删除指定Token
     */
    @DeleteMapping("/token/{token}")
    public Result<String> deleteToken(@PathVariable String token) {
        boolean deleted = tokenService.deleteToken(token);
        if (deleted) {
            return Result.success("Token删除成功");
        } else {
            return Result.error(400, "Token删除失败");
        }
    }

    /**
     * 根据用户名强制下线（删除用户的所有Token）
     */
    @DeleteMapping("/user/{username}/token")
    public Result<String> deleteTokenByUsername(@PathVariable String username) {
        boolean deleted = tokenService.deleteTokenByUsername(username);
        if (deleted) {
            return Result.success(String.format("用户 %s 的Token已删除", username));
        } else {
            return Result.error(400, "删除失败");
        }
    }

    /**
     * 获取所有Token Key（列出所有token:*的key）
     */
    @GetMapping("/keys/tokens")
    public Result<Map<String, Object>> getAllTokenKeys() {
        try {
            Set<String> keys = redisTemplate.keys("token:*");
            Map<String, Object> data = new HashMap<>();
            data.put("count", keys != null ? keys.size() : 0);
            data.put("keys", keys);
            return Result.success(data);
        } catch (Exception e) {
            log.error(String.format("获取Token Keys失败: %s", e.getMessage()), e);
            return Result.error(500, "获取失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有用户Token映射（列出所有user_token:*的key）
     */
    @GetMapping("/keys/user-tokens")
    public Result<Map<String, Object>> getAllUserTokenKeys() {
        try {
            Set<String> keys = redisTemplate.keys("user_token:*");
            Map<String, Object> data = new HashMap<>();
            data.put("count", keys != null ? keys.size() : 0);
            data.put("keys", keys);
            return Result.success(data);
        } catch (Exception e) {
            log.error(String.format("获取用户Token Keys失败: %s", e.getMessage()), e);
            return Result.error(500, "获取失败: " + e.getMessage());
        }
    }

    /**
     * 获取指定Key的值
     */
    @GetMapping("/key/{key}")
    public Result<Map<String, Object>> getKeyValue(@PathVariable String key) {
        try {
            String value = redisTemplate.opsForValue().get(key);
            Map<String, Object> data = new HashMap<>();
            data.put("key", key);
            data.put("value", value);
            data.put("exists", value != null);
            return Result.success(data);
        } catch (Exception e) {
            log.error(String.format("获取Key值失败: %s", e.getMessage()), e);
            return Result.error(500, "获取失败: " + e.getMessage());
        }
    }

    /**
     * 设置Key的值
     */
    @PostMapping("/key/{key}")
    public Result<Map<String, Object>> setKeyValue(
            @PathVariable String key,
            @RequestBody Map<String, String> request) {
        try {
            String value = request.get("value");
            Long expireSeconds = request.get("expireSeconds") != null ? 
                Long.parseLong(request.get("expireSeconds")) : null;

            if (expireSeconds != null && expireSeconds > 0) {
                redisTemplate.opsForValue().set(key, value, expireSeconds, TimeUnit.SECONDS);
            } else {
                redisTemplate.opsForValue().set(key, value);
            }

            Map<String, Object> data = new HashMap<>();
            data.put("key", key);
            data.put("value", value);
            data.put("expireSeconds", expireSeconds);
            return Result.success("设置成功", data);
        } catch (Exception e) {
            log.error(String.format("设置Key值失败: %s", e.getMessage()), e);
            return Result.error(500, "设置失败: " + e.getMessage());
        }
    }

    /**
     * 删除指定Key
     */
    @DeleteMapping("/key/{key}")
    public Result<String> deleteKey(@PathVariable String key) {
        try {
            Boolean deleted = redisTemplate.delete(key);
            if (Boolean.TRUE.equals(deleted)) {
                return Result.success("Key删除成功");
            } else {
                return Result.error(404, "Key不存在");
            }
        } catch (Exception e) {
            log.error(String.format("删除Key失败: %s", e.getMessage()), e);
            return Result.error(500, "删除失败: " + e.getMessage());
        }
    }

    /**
     * 获取Key的剩余过期时间（秒）
     */
    @GetMapping("/key/{key}/ttl")
    public Result<Map<String, Object>> getKeyTtl(@PathVariable String key) {
        try {
            Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
            Map<String, Object> data = new HashMap<>();
            data.put("key", key);
            data.put("ttl", ttl);
            data.put("exists", ttl != null && ttl > -2);
            // -1: 永不过期, -2: key不存在, >=0: 剩余秒数
            return Result.success(data);
        } catch (Exception e) {
            log.error(String.format("获取Key TTL失败: %s", e.getMessage()), e);
            return Result.error(500, "获取失败: " + e.getMessage());
        }
    }

    /**
     * 设置Key的过期时间
     */
    @PostMapping("/key/{key}/expire")
    public Result<Map<String, Object>> setKeyExpire(
            @PathVariable String key,
            @RequestBody Map<String, Long> request) {
        try {
            Long seconds = request.get("seconds");
            if (seconds == null || seconds <= 0) {
                return Result.error(400, "过期时间必须大于0");
            }

            Boolean result = redisTemplate.expire(key, seconds, TimeUnit.SECONDS);
            Map<String, Object> data = new HashMap<>();
            data.put("key", key);
            data.put("expireSeconds", seconds);
            data.put("success", Boolean.TRUE.equals(result));
            
            if (Boolean.TRUE.equals(result)) {
                return Result.success("设置过期时间成功", data);
            } else {
                return Result.error(404, "Key不存在", data);
            }
        } catch (Exception e) {
            log.error(String.format("设置Key过期时间失败: %s", e.getMessage()), e);
            return Result.error(500, "设置失败: " + e.getMessage());
        }
    }

    /**
     * 获取Redis信息
     */
    @GetMapping("/info")
    public Result<Map<String, Object>> getRedisInfo() {
        try {
            // 统计Token数量
            Set<String> tokenKeys = redisTemplate.keys("token:*");
            Set<String> userTokenKeys = redisTemplate.keys("user_token:*");
            
            Map<String, Object> data = new HashMap<>();
            data.put("tokenCount", tokenKeys != null ? tokenKeys.size() : 0);
            data.put("userTokenCount", userTokenKeys != null ? userTokenKeys.size() : 0);
            data.put("message", "Redis连接正常");
            return Result.success(data);
        } catch (Exception e) {
            log.error(String.format("获取Redis信息失败: %s", e.getMessage()), e);
            return Result.error(500, "获取失败: " + e.getMessage());
        }
    }

    /**
     * 获取在线用户列表（分页）
     */
    @GetMapping("/online-users")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Result<Map<String, Object>> getOnlineUsers(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "15") Integer size,
            @RequestParam(required = false) String keyword) {
        try {
            // 获取所有token keys
            Set<String> tokenKeys = redisTemplate.keys("token:*");
            if (tokenKeys == null || tokenKeys.isEmpty()) {
                Map<String, Object> result = new HashMap<>();
                result.put("records", new ArrayList<>());
                result.put("total", 0);
                result.put("current", current);
                result.put("size", size);
                result.put("pages", 0);
                return Result.success(result);
            }

            // 获取所有token信息
            List<Map<String, Object>> onlineUsers = new ArrayList<>();
            for (String tokenKey : tokenKeys) {
                String tokenJson = redisTemplate.opsForValue().get(tokenKey);
                if (tokenJson != null && !tokenJson.isEmpty()) {
                    try {
                        // 从tokenKey中提取token值（去掉"token:"前缀）
                        String token = tokenKey.substring(6);
                        TokenInfo tokenInfo = tokenService.getTokenInfo(token);
                        if (tokenInfo != null) {
                            // 如果有关键词，进行过滤
                            if (keyword != null && !keyword.trim().isEmpty()) {
                                String keywordLower = keyword.trim().toLowerCase();
                                boolean matches = (tokenInfo.getUsername() != null && 
                                    tokenInfo.getUsername().toLowerCase().contains(keywordLower)) ||
                                    (tokenInfo.getUserId() != null && 
                                    tokenInfo.getUserId().toLowerCase().contains(keywordLower));
                                if (!matches) {
                                    continue;
                                }
                            }

                            Map<String, Object> userInfo = new HashMap<>();
                            userInfo.put("token", tokenInfo.getToken());
                            userInfo.put("username", tokenInfo.getUsername());
                            userInfo.put("userId", tokenInfo.getUserId());
                            userInfo.put("roles", tokenInfo.getRoles());
                            userInfo.put("createTime", tokenInfo.getCreateTime());
                            userInfo.put("lastRefreshTime", tokenInfo.getLastRefreshTime());
                            userInfo.put("expireTime", tokenInfo.getExpireTime());
                            onlineUsers.add(userInfo);
                        }
                    } catch (Exception e) {
                        log.warn("解析token信息失败: " + tokenKey, e);
                    }
                }
            }

            // 按最后刷新时间倒序排序
            onlineUsers.sort((a, b) -> {
                LocalDateTime timeA = (LocalDateTime) a.get("lastRefreshTime");
                LocalDateTime timeB = (LocalDateTime) b.get("lastRefreshTime");
                if (timeA == null && timeB == null) return 0;
                if (timeA == null) return 1;
                if (timeB == null) return -1;
                return timeB.compareTo(timeA);
            });

            // 分页处理
            int total = onlineUsers.size();
            int start = (current - 1) * size;
            int end = Math.min(start + size, total);
            List<Map<String, Object>> pagedUsers = start < total 
                ? onlineUsers.subList(start, end) 
                : new ArrayList<>();

            Map<String, Object> result = new HashMap<>();
            result.put("records", pagedUsers);
            result.put("total", total);
            result.put("current", current);
            result.put("size", size);
            result.put("pages", (int) Math.ceil((double) total / size));
            return Result.success(result);
        } catch (Exception e) {
            log.error("获取在线用户列表失败: " + e.getMessage(), e);
            return Result.error(500, "获取失败: " + e.getMessage());
        }
    }

    /**
     * 踢用户下线（删除指定用户的token）
     */
    @PostMapping("/online-users/kick")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Result<String> kickUserOffline(@RequestParam String token) {
        try {
            // 获取当前用户角色
            org.springframework.security.core.Authentication authentication = 
                SecurityContextHolder.getContext().getAuthentication();
            boolean isSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            
            // 获取被踢用户的token信息
            TokenInfo tokenInfo = tokenService.getTokenInfo(token);
            if (tokenInfo == null) {
                return Result.error(404, "Token不存在或已过期");
            }
            
            // 检查：不能踢自己下线
            String currentUsername = authentication.getName();
            if (currentUsername != null && currentUsername.equals(tokenInfo.getUsername())) {
                return Result.error(403, "不能踢自己下线");
            }
            
            // 检查权限：管理员不能踢超级管理员
            if (!isSuperAdmin) {
                // 当前用户是管理员，检查被踢用户的角色
                List<String> targetUserRoles = tokenInfo.getRoles();
                if (targetUserRoles != null && targetUserRoles.contains("SUPER_ADMIN")) {
                    return Result.error(403, "管理员不能踢超级管理员下线");
                }
            }
            // 超级管理员可以踢任何人（包括管理员和普通用户）
            
            boolean deleted = tokenService.deleteToken(token);
            if (deleted) {
                log.info(String.format("管理员踢用户下线: 操作者=%s, 被踢用户=%s, token=%s", 
                    authentication.getName(), tokenInfo.getUsername(), token));
                return Result.success("用户已下线");
            } else {
                return Result.error(404, "Token不存在或已过期");
            }
        } catch (Exception e) {
            log.error("踢用户下线失败: " + e.getMessage(), e);
            return Result.error(500, "操作失败: " + e.getMessage());
        }
    }

    /**
     * 清空所有Token相关的Key（危险操作）
     */
    @DeleteMapping("/tokens/clear")
    public Result<Map<String, Object>> clearAllTokens() {
        try {
            Set<String> tokenKeys = redisTemplate.keys("token:*");
            Set<String> userTokenKeys = redisTemplate.keys("user_token:*");
            
            int deletedCount = 0;
            if (tokenKeys != null && !tokenKeys.isEmpty()) {
                deletedCount += redisTemplate.delete(tokenKeys);
            }
            if (userTokenKeys != null && !userTokenKeys.isEmpty()) {
                deletedCount += redisTemplate.delete(userTokenKeys);
            }

            Map<String, Object> data = new HashMap<>();
            data.put("deletedCount", deletedCount);
            data.put("message", "已清空所有Token");
            return Result.success("清空成功", data);
        } catch (Exception e) {
            log.error(String.format("清空Token失败: %s", e.getMessage()), e);
            return Result.error(500, "清空失败: " + e.getMessage());
        }
    }
}


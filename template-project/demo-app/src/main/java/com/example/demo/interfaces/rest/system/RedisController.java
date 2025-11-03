package com.example.demo.interfaces.rest.system;

import com.example.demo.common.result.Result;
import com.example.demo.domain.security.entity.TokenInfo;
import com.example.demo.infrastructure.cache.TokenService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Redis管理控制器
 * 提供详细的Redis操作接口（需要管理员权限）
 */
@Slf4j
@RestController
@RequestMapping("/api/redis")
@PreAuthorize("hasRole('ADMIN')")
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


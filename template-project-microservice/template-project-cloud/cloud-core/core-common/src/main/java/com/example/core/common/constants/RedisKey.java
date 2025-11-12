package com.example.core.common.constants;

/**
 * Redis Key 常量
 */
public class RedisKey {
    /**
     * Token 前缀
     */
    public static final String TOKEN_PREFIX = "token:";

    /**
     * 用户信息前缀
     */
    public static final String USER_PREFIX = "user:";

    /**
     * 权限信息前缀
     */
    public static final String PERMISSION_PREFIX = "permission:";

    /**
     * 缓存前缀
     */
    public static final String CACHE_PREFIX = "cache:";

    /**
     * 分布式锁前缀
     */
    public static final String LOCK_PREFIX = "lock:";

    /**
     * 限流前缀
     */
    public static final String RATE_LIMIT_PREFIX = "rate_limit:";

    /**
     * 生成 Token Key
     */
    public static String tokenKey(String userId) {
        return TOKEN_PREFIX + userId;
    }

    /**
     * 生成用户信息 Key
     */
    public static String userKey(String userId) {
        return USER_PREFIX + userId;
    }

    /**
     * 生成权限信息 Key
     */
    public static String permissionKey(String userId) {
        return PERMISSION_PREFIX + userId;
    }

    /**
     * 生成缓存 Key
     */
    public static String cacheKey(String module, String key) {
        return CACHE_PREFIX + module + ":" + key;
    }

    /**
     * 生成分布式锁 Key
     */
    public static String lockKey(String resource) {
        return LOCK_PREFIX + resource;
    }

    /**
     * 生成限流 Key
     */
    public static String rateLimitKey(String resource) {
        return RATE_LIMIT_PREFIX + resource;
    }
}


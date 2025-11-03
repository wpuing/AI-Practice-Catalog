package com.example.demo.common.constants;

/**
 * Redis Key 常量类
 * 统一管理所有Redis key的前缀和格式，避免Redis杂乱无序
 */
public class RedisKeyConstants {

    /**
     * Token相关Key前缀
     */
    public static class Token {
        /** Token主键前缀: token:{token} */
        public static final String TOKEN = "token:";
        
        /** 用户Token映射前缀: user_token:{username} */
        public static final String USER_TOKEN = "user_token:";
        
        /** 浏览器Token映射前缀: browser_token:{browserId} */
        public static final String BROWSER_TOKEN = "browser_token:";
        
        /** 用户浏览器Token映射前缀: user_browser:{userId}:{browserId} */
        public static final String USER_BROWSER = "user_browser:";
        
        /** IP用户Token映射前缀: ip_user_token:{ip}:{userId} */
        public static final String IP_USER_TOKEN = "ip_user_token:";
        
        /** IP用户列表前缀: ip_users:{ip} */
        public static final String IP_USERS = "ip_users:";
    }

    /**
     * 角色权限相关Key前缀
     */
    public static class Role {
        /** 用户角色缓存前缀: user_roles:{userId} */
        public static final String USER_ROLES = "user_roles:";
        
        /** 所有角色列表Key: roles:all */
        public static final String ALL_ROLES = "roles:all";
    }

    /**
     * 生成Token Key
     */
    public static String getTokenKey(String token) {
        return Token.TOKEN + token;
    }

    /**
     * 生成用户Token映射Key
     */
    public static String getUserTokenKey(String username) {
        return Token.USER_TOKEN + username;
    }

    /**
     * 生成浏览器Token映射Key
     */
    public static String getBrowserTokenKey(String browserId) {
        return Token.BROWSER_TOKEN + browserId;
    }

    /**
     * 生成用户浏览器Token映射Key
     */
    public static String getUserBrowserKey(String userId, String browserId) {
        return Token.USER_BROWSER + userId + ":" + browserId;
    }

    /**
     * 生成IP用户Token映射Key
     */
    public static String getIpUserTokenKey(String ip, String userId) {
        return Token.IP_USER_TOKEN + ip + ":" + userId;
    }

    /**
     * 生成IP用户列表Key
     */
    public static String getIpUsersKey(String ip) {
        return Token.IP_USERS + ip;
    }

    /**
     * 生成用户角色缓存Key
     */
    public static String getUserRolesKey(String userId) {
        return Role.USER_ROLES + userId;
    }

    /**
     * 获取所有角色列表Key
     */
    public static String getAllRolesKey() {
        return Role.ALL_ROLES;
    }
}


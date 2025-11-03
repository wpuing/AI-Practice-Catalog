package com.example.demo.domain.security.entity;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Token信息实体（存储在Redis中）
 */
@Data
public class TokenInfo implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Token值（32位随机值）
     */
    private String token;

    /**
     * 用户名
     */
    private String username;

    /**
     * 用户ID
     */
    private String userId;

    /**
     * 角色列表
     */
    private List<String> roles;

    /**
     * 权限列表
     */
    private List<String> permissions;

    /**
     * Token创建时间
     */
    private LocalDateTime createTime;

    /**
     * Token最后刷新时间
     */
    private LocalDateTime lastRefreshTime;

    /**
     * Token过期时间
     */
    private LocalDateTime expireTime;
}


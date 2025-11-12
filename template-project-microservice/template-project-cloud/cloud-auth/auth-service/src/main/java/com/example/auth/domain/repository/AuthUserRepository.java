package com.example.auth.domain.repository;

import com.example.auth.domain.entity.AuthUser;

/**
 * 认证用户仓储接口
 */
public interface AuthUserRepository {
    /**
     * 根据用户名查询用户
     */
    AuthUser findByUsername(String username);

    /**
     * 根据ID查询用户
     */
    AuthUser findById(String id);

    /**
     * 保存用户
     */
    void save(AuthUser user);

    /**
     * 更新用户
     */
    void update(AuthUser user);
}


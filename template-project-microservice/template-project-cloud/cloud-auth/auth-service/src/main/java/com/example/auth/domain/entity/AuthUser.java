package com.example.auth.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 认证用户实体
 */
@Data
@TableName("auth_user")
public class AuthUser {
    /**
     * 用户ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private String id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码
     */
    private String password;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 状态（0-禁用，1-启用）
     */
    private Integer status;

    /**
     * 创建时间
     */
    private LocalDateTime createDate;

    /**
     * 创建用户
     */
    private String createUser;

    /**
     * 更新时间
     */
    private LocalDateTime updateDate;

    /**
     * 更新用户
     */
    private String updateUser;

    /**
     * 是否删除（0-未删除，1-已删除）
     */
    private Integer deleted;

    /**
     * 版本号（乐观锁）
     */
    private Integer dbVersion;
}


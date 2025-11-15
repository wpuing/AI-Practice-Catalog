package com.example.user.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户信息实体
 */
@Data
@TableName("user_info")
public class UserInfo {
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
     * 昵称
     */
    private String nickname;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 头像
     */
    private String avatar;

    /**
     * 性别（0-未知，1-男，2-女）
     */
    private Integer gender;

    /**
     * 生日
     */
    private LocalDate birthday;

    /**
     * 地址
     */
    private String address;

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




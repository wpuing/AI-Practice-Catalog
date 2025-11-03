package com.example.demo.common.enums;

import lombok.Getter;

/**
 * 状态码枚举
 * 统一管理所有HTTP响应状态码和业务状态码
 */
@Getter
public enum StatusCode {

    // ========== 成功状态码 (2xx) ==========
    SUCCESS(200, "操作成功"),

    // ========== 客户端错误状态码 (4xx) ==========
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权，请先登录"),
    FORBIDDEN(403, "无权限访问"),
    NOT_FOUND(404, "资源不存在"),

    // ========== 服务器错误状态码 (5xx) ==========
    INTERNAL_SERVER_ERROR(500, "服务器内部错误"),

    // ========== 业务状态码 ==========
    /** 用户名或密码错误 */
    LOGIN_FAILED(401, "用户名或密码错误"),
    /** Token已失效 */
    TOKEN_EXPIRED(401, "Token已失效，请重新登录"),
    /** 未提供Token */
    TOKEN_MISSING(401, "未提供Token"),
    /** Token无效或已过期 */
    TOKEN_INVALID(401, "Token无效或已过期"),
    /** 用户名不能为空 */
    USERNAME_EMPTY(400, "用户名不能为空"),
    /** 密码不能为空 */
    PASSWORD_EMPTY(400, "密码不能为空"),
    /** 请求体不能为空 */
    REQUEST_BODY_EMPTY(400, "请求体不能为空"),
    /** 用户名已存在 */
    USERNAME_EXISTS(400, "用户名已存在"),
    /** 用户不存在 */
    USER_NOT_FOUND(404, "用户不存在"),
    /** 角色不存在 */
    ROLE_NOT_FOUND(404, "角色不存在"),
    /** 角色代码已存在 */
    ROLE_CODE_EXISTS(400, "角色代码已存在"),
    /** 角色代码不能为空 */
    ROLE_CODE_EMPTY(400, "角色代码不能为空"),
    /** 创建失败 */
    CREATE_FAILED(500, "创建失败"),
    /** 更新失败 */
    UPDATE_FAILED(500, "更新失败"),
    /** 删除失败 */
    DELETE_FAILED(500, "删除失败"),
    /** 登录失败 */
    LOGIN_ERROR(500, "登录失败"),
    /** 注册失败 */
    REGISTER_FAILED(500, "注册失败"),
    /** 退出登录成功 */
    LOGOUT_SUCCESS(200, "退出登录成功，已清除所有登录信息"),
    /** Token刷新成功 */
    TOKEN_REFRESH_SUCCESS(200, "Token刷新成功"),
    /** 注册成功 */
    REGISTER_SUCCESS(200, "注册成功"),
    /** 登录成功 */
    LOGIN_SUCCESS(200, "登录成功"),
    /** 分配成功 */
    ASSIGN_SUCCESS(200, "分配成功"),
    /** 分配失败 */
    ASSIGN_FAILED(500, "分配失败"),
    /** 缓存已刷新 */
    CACHE_REFRESHED(200, "缓存已刷新"),
    /** 缓存已清除并重新加载 */
    CACHE_CLEARED(200, "缓存已清除并重新加载");

    /**
     * 状态码
     */
    private final Integer code;

    /**
     * 状态消息
     */
    private final String message;

    StatusCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}


package com.example.demo.common.constants;

/**
 * 日志消息常量类
 * 统一管理所有日志输出内容，避免日志消息分散在各处
 */
public class LogMessages {

    /**
     * Token相关日志消息
     */
    public static class Token {
        /** Token保存成功: token=%s, username=%s, browserId=%s, ip=%s, expireTime=%d秒 */
        public static final String SAVE_SUCCESS = "保存Token到Redis: token=%s, username=%s, browserId=%s, ip=%s, expireTime=%d秒";
        
        /** Token保存失败: %s */
        public static final String SAVE_FAILED = "保存Token到Redis失败: %s";
        
        /** Token不存在或已过期: %s */
        public static final String NOT_FOUND_OR_EXPIRED = "Token不存在或已过期: %s";
        
        /** Token超过刷新间隔未刷新（30分钟），已失效: token=%s, lastRefresh=%s, now=%s */
        public static final String EXPIRED_NO_REFRESH = "Token超过刷新间隔未刷新（30分钟），已失效: token=%s, lastRefresh=%s, now=%s";
        
        /** 从Redis获取Token信息失败: %s */
        public static final String GET_INFO_FAILED = "从Redis获取Token信息失败: %s";
        
        /** 刷新Token失败，Token不存在或已过期: %s */
        public static final String REFRESH_FAILED_NOT_FOUND = "刷新Token失败，Token不存在或已过期: %s";
        
        /** 刷新Token成功: token=%s, username=%s */
        public static final String REFRESH_SUCCESS = "刷新Token成功: token=%s, username=%s";
        
        /** 刷新Token失败: %s */
        public static final String REFRESH_FAILED = "刷新Token失败: %s";
        
        /** 删除Token: token=%s, username=%s */
        public static final String DELETE_SUCCESS = "删除Token: token=%s, username=%s";
        
        /** 删除Token失败: %s */
        public static final String DELETE_FAILED = "删除Token失败: %s";
        
        /** 删除浏览器Token映射: browserKey=%s */
        public static final String DELETE_BROWSER_MAPPING = "删除浏览器Token映射: browserKey=%s";
        
        /** 删除用户浏览器Token映射: userBrowserKey=%s */
        public static final String DELETE_USER_BROWSER_MAPPING = "删除用户浏览器Token映射: userBrowserKey=%s";
        
        /** 删除IP用户Token映射: ipUserKey=%s */
        public static final String DELETE_IP_USER_MAPPING = "删除IP用户Token映射: ipUserKey=%s";
        
        /** 从IP用户列表中移除用户: ip=%s, userId=%s */
        public static final String REMOVE_USER_FROM_IP = "从IP用户列表中移除用户: ip=%s, userId=%s";
        
        /** 删除浏览器/IP Token映射时出错: %s */
        public static final String DELETE_MAPPING_ERROR = "删除浏览器/IP Token映射时出错: %s";
        
        /** 根据用户名删除Token失败: %s */
        public static final String DELETE_BY_USERNAME_FAILED = "根据用户名删除Token失败: %s";
        
        /** 开始删除用户的所有登录信息: userId=%s, username=%s */
        public static final String DELETE_ALL_START = "开始删除用户的所有登录信息: userId=%s, username=%s";
        
        /** 删除用户浏览器token映射，共 %d 条 */
        public static final String DELETE_USER_BROWSER_COUNT = "删除用户浏览器token映射，共 %d 条";
        
        /** 用户的所有登录信息已删除: userId=%s, username=%s */
        public static final String DELETE_ALL_SUCCESS = "用户的所有登录信息已删除: userId=%s, username=%s";
        
        /** 删除用户所有登录信息失败: userId=%s, username=%s, error=%s */
        public static final String DELETE_ALL_FAILED = "删除用户所有登录信息失败: userId=%s, username=%s, error=%s";
        
        /** 浏览器已有其他用户登录，删除旧token: browserId=%s, oldToken=%s */
        public static final String BROWSER_HAS_OTHER_USER = "浏览器已有其他用户登录，删除旧token: browserId=%s, oldToken=%s";
        
        /** 用户在该浏览器已有登录，删除旧token: userId=%s, browserId=%s, oldToken=%s */
        public static final String USER_HAS_BROWSER_TOKEN = "用户在该浏览器已有登录，删除旧token: userId=%s, browserId=%s, oldToken=%s";
        
        /** 同一IP下同一用户已有登录，删除旧token: ip=%s, userId=%s, oldToken=%s */
        public static final String IP_USER_HAS_TOKEN = "同一IP下同一用户已有登录，删除旧token: ip=%s, userId=%s, oldToken=%s";
        
        /** IP用户数已达上限，删除最旧的登录: ip=%s, userId=%s, oldToken=%s */
        public static final String IP_MAX_USERS_REACHED = "IP用户数已达上限，删除最旧的登录: ip=%s, userId=%s, oldToken=%s";
        
        /** Token无效或已过期: %s */
        public static final String INVALID_OR_EXPIRED = "Token无效或已过期: %s";
        
        /** Token验证成功: username=%s, token=%s */
        public static final String VERIFY_SUCCESS = "Token验证成功: username=%s, token=%s";
        
        /** Token验证失败: %s */
        public static final String VERIFY_FAILED = "Token验证失败: %s";
    }

    /**
     * 认证相关日志消息
     */
    public static class Auth {
        /** 用户登录请求，用户名: %s */
        public static final String LOGIN_REQUEST = "用户登录请求，用户名: %s";
        
        /** 登录失败，用户不存在: %s */
        public static final String LOGIN_USER_NOT_FOUND = "登录失败，用户不存在: %s";
        
        /** 密码验证详情 - 用户名: %s, 输入密码长度: %d, 数据库密码长度: %d */
        public static final String PASSWORD_VERIFY_DETAIL = "密码验证详情 - 用户名: %s, 输入密码长度: %d, 数据库密码长度: %d";
        
        /** 数据库密码前10个字符: %s */
        public static final String PASSWORD_PREFIX = "数据库密码前10个字符: %s";
        
        /** 数据库密码完整: %s */
        public static final String PASSWORD_FULL = "数据库密码完整: %s";
        
        /** 密码验证结果: %s */
        public static final String PASSWORD_VERIFY_RESULT = "密码验证结果: %s";
        
        /** 检测到密码有空格，尝试去除空格后验证 */
        public static final String PASSWORD_TRIM_DETECTED = "检测到密码有空格，尝试去除空格后验证";
        
        /** 已更新数据库密码（去除空格） */
        public static final String PASSWORD_TRIM_UPDATED = "已更新数据库密码（去除空格）";
        
        /** 密码验证失败: %s */
        public static final String PASSWORD_VERIFY_FAILED = "密码验证失败: %s";
        
        /** 输入密码: [%s], 数据库密码: [%s] */
        public static final String PASSWORD_COMPARISON = "输入密码: [%s], 数据库密码: [%s]";
        
        /** 用户登录成功: username=%s, token=%s */
        public static final String LOGIN_SUCCESS = "用户登录成功: username=%s, token=%s";
        
        /** 登录失败，密码错误: %s */
        public static final String LOGIN_PASSWORD_ERROR = "登录失败，密码错误: %s";
        
        /** 登录失败，认证异常: %s, 错误: %s */
        public static final String LOGIN_AUTH_ERROR = "登录失败，认证异常: %s, 错误: %s";
        
        /** 登录异常: %s */
        public static final String LOGIN_EXCEPTION = "登录异常: %s";
        
        /** 用户退出登录，已清除所有登录信息: username=%s, userId=%s */
        public static final String LOGOUT_SUCCESS = "用户退出登录，已清除所有登录信息: username=%s, userId=%s";
        
        /** 退出登录时Token已失效，仅删除提供的token */
        public static final String LOGOUT_TOKEN_EXPIRED = "退出登录时Token已失效，仅删除提供的token";
    }

    /**
     * 角色缓存相关日志消息
     */
    public static class RoleCache {
        /** 缓存用户角色: userId=%s, roles=%s */
        public static final String CACHE_USER_ROLES = "缓存用户角色: userId=%s, roles=%s";
        
        /** 缓存用户角色失败: userId=%s, error=%s */
        public static final String CACHE_USER_ROLES_FAILED = "缓存用户角色失败: userId=%s, error=%s";
        
        /** 从缓存获取用户角色: userId=%s, roles=%s */
        public static final String GET_FROM_CACHE = "从缓存获取用户角色: userId=%s, roles=%s";
        
        /** 缓存未命中，从数据库获取用户角色: userId=%s */
        public static final String CACHE_MISS = "缓存未命中，从数据库获取用户角色: userId=%s";
        
        /** 删除用户角色缓存: userId=%s */
        public static final String DELETE_USER_ROLES = "删除用户角色缓存: userId=%s";
        
        /** 删除用户角色缓存失败: userId=%s, error=%s */
        public static final String DELETE_USER_ROLES_FAILED = "删除用户角色缓存失败: userId=%s, error=%s";
        
        /** 缓存所有角色到Redis，共 %d 个角色 */
        public static final String CACHE_ALL_ROLES = "缓存所有角色到Redis，共 %d 个角色";
        
        /** 缓存所有角色失败: %s */
        public static final String CACHE_ALL_ROLES_FAILED = "缓存所有角色失败: %s";
        
        /** 清除所有角色缓存 */
        public static final String CLEAR_ALL_ROLES = "清除所有角色缓存";
        
        /** 清除所有角色缓存失败: %s */
        public static final String CLEAR_ALL_ROLES_FAILED = "清除所有角色缓存失败: %s";
        
        /** 清除所有用户角色缓存，共 %d 条 */
        public static final String CLEAR_ALL_USER_ROLES = "清除所有用户角色缓存，共 %d 条";
        
        /** 清除所有用户角色缓存失败: %s */
        public static final String CLEAR_ALL_USER_ROLES_FAILED = "清除所有用户角色缓存失败: %s";
        
        /** 开始初始化用户角色缓存... */
        public static final String INIT_START = "开始初始化用户角色缓存...";
        
        /** 用户角色缓存初始化完成，共缓存 %d 个用户的角色信息 */
        public static final String INIT_SUCCESS = "用户角色缓存初始化完成，共缓存 %d 个用户的角色信息";
        
        /** 初始化用户角色缓存失败: %s */
        public static final String INIT_FAILED = "初始化用户角色缓存失败: %s";
        
        /** 刷新用户角色缓存: userId=%s, roles=%s */
        public static final String REFRESH_USER_ROLES = "刷新用户角色缓存: userId=%s, roles=%s";
    }

    /**
     * 用户服务相关日志消息
     */
    public static class User {
        /** 加载用户信息: %s */
        public static final String LOAD_USER = "加载用户信息: %s";
        
        /** 用户不存在: %s */
        public static final String USER_NOT_FOUND = "用户不存在: %s";
        
        /** 找到用户: %s, ID: %s, 密码长度: %d */
        public static final String USER_FOUND = "找到用户: %s, ID: %s, 密码长度: %d";
        
        /** 用户 %s 的角色: %s */
        public static final String USER_ROLES = "用户 %s 的角色: %s";
    }

    /**
     * 安全配置相关日志消息
     */
    public static class Security {
        /** 跳过JWT过滤器，白名单路径: %s (匹配模式: %s) */
        public static final String SKIP_JWT_FILTER = "跳过JWT过滤器，白名单路径: %s (匹配模式: %s)";
        
        /** SecurityContext已存在认证信息，跳过JWT验证 */
        public static final String SKIP_JWT_AUTH = "SecurityContext已存在认证信息，跳过JWT验证";
        
        /** 处理JWT验证，路径: %s, %s */
        public static final String PROCESS_JWT_VERIFY = "处理JWT验证，路径: %s, %s";
        
        /** 加载白名单失败，使用默认白名单: %s */
        public static final String LOAD_WHITELIST_FAILED = "加载白名单失败，使用默认白名单: %s";
        
        /** 配置白名单，共 %d 条规则 */
        public static final String CONFIG_WHITELIST = "配置白名单，共 %d 条规则";
    }

    /**
     * 浏览器标识相关日志消息
     */
    public static class Browser {
        /** 生成浏览器ID: userAgent=%s, ip=%s, browserId=%s */
        public static final String GENERATE_BROWSER_ID = "生成浏览器ID: userAgent=%s, ip=%s, browserId=%s";
        
        /** MD5哈希失败: %s */
        public static final String MD5_HASH_FAILED = "MD5哈希失败: %s";
    }

    /**
     * 角色服务相关日志消息
     */
    public static class RoleService {
        /** 保存角色并更新缓存: roleCode=%s */
        public static final String SAVE_ROLE_SUCCESS = "保存角色并更新缓存: roleCode=%s";
        
        /** 更新角色并同步缓存: roleCode=%s */
        public static final String UPDATE_ROLE_SUCCESS = "更新角色并同步缓存: roleCode=%s";
        
        /** 删除角色并清除缓存: roleCode=%s */
        public static final String DELETE_ROLE_SUCCESS = "删除角色并清除缓存: roleCode=%s";
    }

    /**
     * 用户角色服务相关日志消息
     */
    public static class UserRoleService {
        /** 保存用户角色关联并更新缓存: userId=%s, roleId=%s */
        public static final String SAVE_USER_ROLE = "保存用户角色关联并更新缓存: userId=%s, roleId=%s";
        
        /** 删除用户角色关联并更新缓存: userId=%s, roleId=%s */
        public static final String DELETE_USER_ROLE = "删除用户角色关联并更新缓存: userId=%s, roleId=%s";
        
        /** 删除用户所有角色关联并清除缓存: userId=%s */
        public static final String DELETE_USER_ALL_ROLES = "删除用户所有角色关联并清除缓存: userId=%s";
        
        /** 删除角色所有用户关联并更新缓存: roleId=%s, 影响用户数=%d */
        public static final String DELETE_ROLE_ALL_USERS = "删除角色所有用户关联并更新缓存: roleId=%s, 影响用户数=%d";
        
        /** 批量保存用户角色关联并更新缓存: userId=%s, roleIds=%s */
        public static final String BATCH_SAVE_USER_ROLES = "批量保存用户角色关联并更新缓存: userId=%s, roleIds=%s";
    }
}


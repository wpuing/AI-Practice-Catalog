package com.example.demo.infrastructure.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * MyBatis-Plus 自动填充处理器
 * 用于自动填充基础字段：create_date, create_user, update_date, update_user, deleted, db_version
 */
@Slf4j
@Component
public class MetaObjectHandler implements com.baomidou.mybatisplus.core.handlers.MetaObjectHandler {

    /**
     * 获取当前登录用户ID
     */
    private String getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
                // 尝试从认证信息中获取用户ID
                // 如果认证信息中包含用户ID，则返回；否则返回用户名
                Object principal = authentication.getPrincipal();
                if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                    // 如果实现了UserDetails，可以尝试获取用户ID
                    // 这里暂时返回用户名，实际项目中应该从UserDetails中获取用户ID
                    return authentication.getName();
                }
                return authentication.getName();
            }
        } catch (Exception e) {
            log.warn("获取当前用户ID失败: {}", e.getMessage());
        }
        return "system"; // 默认值
    }

    /**
     * 插入时自动填充
     */
    @Override
    public void insertFill(MetaObject metaObject) {
        LocalDateTime now = LocalDateTime.now();
        String currentUserId = getCurrentUserId();

        // 填充创建时间（支持新字段名和旧字段名）
        this.strictInsertFill(metaObject, "createDate", LocalDateTime.class, now);
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, now);

        // 填充创建用户ID
        this.strictInsertFill(metaObject, "createUser", String.class, currentUserId);

        // 填充是否删除（默认为0，未删除）
        this.strictInsertFill(metaObject, "deleted", Integer.class, 0);

        // 填充版本号（默认为1）
        this.strictInsertFill(metaObject, "dbVersion", Integer.class, 1);
        this.strictInsertFill(metaObject, "version", Integer.class, 1);

        // 填充更新时间（插入时也设置）
        this.strictInsertFill(metaObject, "updateDate", LocalDateTime.class, now);
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);
    }

    /**
     * 更新时自动填充
     */
    @Override
    public void updateFill(MetaObject metaObject) {
        LocalDateTime now = LocalDateTime.now();
        String currentUserId = getCurrentUserId();

        // 填充更新时间
        this.strictUpdateFill(metaObject, "updateDate", LocalDateTime.class, now);
        // 如果字段名是 update_time，也填充
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, now);

        // 填充修改用户ID
        this.strictUpdateFill(metaObject, "updateUser", String.class, currentUserId);

        // 注意：更新时不自动更新版本号，版本号应该由业务逻辑控制（乐观锁）
    }
}


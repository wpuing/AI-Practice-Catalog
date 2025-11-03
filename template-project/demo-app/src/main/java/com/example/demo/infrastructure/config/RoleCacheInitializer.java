package com.example.demo.infrastructure.config;

import com.example.demo.infrastructure.cache.RoleCacheService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * 角色缓存初始化器
 * 系统启动时自动将角色权限信息缓存到Redis
 */
@Slf4j
@Component
@Order(1)  // 设置执行顺序，确保在其他组件之前执行
public class RoleCacheInitializer implements CommandLineRunner {

    @Autowired
    private RoleCacheService roleCacheService;

    @Override
    public void run(String... args) throws Exception {
        log.info("========================================");
        log.info("开始初始化角色权限缓存...");
        try {
            roleCacheService.initAllUserRolesCache();
            log.info("角色权限缓存初始化完成");
        } catch (Exception e) {
            log.error(String.format("角色权限缓存初始化失败: %s", e.getMessage()), e);
            // 不抛出异常，避免影响系统启动
        }
        log.info("========================================");
    }
}


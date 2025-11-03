package com.example.demo.infrastructure.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * 密码生成工具
 * 用于生成新的 BCrypt 密码
 */
@Slf4j
public class PasswordGenerator {

    public static void main(String[] args) {
        // 初始化日志（用于 main 方法）
        org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PasswordGenerator.class);
        
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // 原始密码
        String rawPassword = "123456";
        
        // 生成新的加密密码
        String newEncodedPassword = encoder.encode(rawPassword);
        
        logger.info("========================================");
        logger.info(String.format("原始密码: %s", rawPassword));
        logger.info("新生成的 BCrypt 密码:");
        logger.info(newEncodedPassword);
        logger.info("========================================");
        
        // 验证新生成的密码
        boolean matches = encoder.matches(rawPassword, newEncodedPassword);
        logger.info(String.format("新密码验证结果: %s", matches));
        
        // 验证旧的密码（看看是否真的不对）
        String oldPassword = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K";
        boolean oldMatches = encoder.matches(rawPassword, oldPassword);
        logger.info(String.format("旧密码验证结果: %s", oldMatches));
        
        // 生成 SQL 更新语句
        logger.info("");
        logger.info("========================================");
        logger.info("SQL 更新语句（更新所有用户密码为 123456）:");
        logger.info(String.format("UPDATE \"user\" SET password = '%s' WHERE username IN ('admin', 'user');", newEncodedPassword));
        logger.info("========================================");
    }
}


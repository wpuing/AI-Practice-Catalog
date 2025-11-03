package com.example.demo.infrastructure.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 密码测试工具类
 * 用于生成和验证 BCrypt 密码
 */
@Slf4j
@Component
public class PasswordTestUtil {

    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /**
     * 生成 BCrypt 加密后的密码
     */
    public static String encodePassword(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    /**
     * 验证密码是否匹配
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }

    /**
     * 测试方法：生成 123456 的加密密码
     */
    public static void main(String[] args) {
        // 初始化日志（用于 main 方法）
        org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PasswordTestUtil.class);
        
        String rawPassword = "123456";
        
        // 生成新的加密密码
        String encoded1 = encodePassword(rawPassword);
        logger.info(String.format("新生成的密码: %s", encoded1));
        
        // 验证已知的加密密码
        String knownEncoded = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K";
        boolean matches = matches(rawPassword, knownEncoded);
        logger.info(String.format("已知密码是否匹配: %s", matches));
        
        // 测试新生成的密码
        boolean matchesNew = matches(rawPassword, encoded1);
        logger.info(String.format("新密码是否匹配: %s", matchesNew));
    }
}


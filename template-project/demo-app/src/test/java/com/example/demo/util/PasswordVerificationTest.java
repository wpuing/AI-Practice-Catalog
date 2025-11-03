package com.example.demo.util;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 密码验证测试
 */
@Slf4j
public class PasswordVerificationTest {

    @Test
    public void testPassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // 测试原始密码
        String rawPassword = "123456";
        
        // 生成一个新的加密密码（BCrypt每次生成的哈希都不同，所以不能使用固定的哈希）
        String encodedPassword = encoder.encode(rawPassword);
        
        log.info(String.format("原始密码: %s", rawPassword));
        log.info(String.format("生成的 BCrypt 密码: %s", encodedPassword));
        log.info("========================================");
        
        // 验证密码是否匹配（这是BCrypt的核心功能）
        boolean matches = encoder.matches(rawPassword, encodedPassword);
        log.info(String.format("密码 '%s' 是否匹配: %s", rawPassword, matches));
        
        // 验证 123456 应该匹配
        assertTrue(matches, String.format("密码 %s 应该匹配", rawPassword));
        
        // 验证错误的密码不应该匹配
        boolean wrongMatch = encoder.matches("wrongpassword", encodedPassword);
        assertTrue(!wrongMatch, "错误的密码不应该匹配");
        
        log.info(String.format("错误密码验证: %s (应该是false)", wrongMatch));
        
        // 测试多次编码同一个密码，生成的哈希不同，但都能验证通过
        String encoded2 = encoder.encode(rawPassword);
        String encoded3 = encoder.encode(rawPassword);
        log.info(String.format("第二次编码: %s", encoded2));
        log.info(String.format("第三次编码: %s", encoded3));
        log.info(String.format("注意：每次编码结果都不同，但都能验证原始密码"));
        
        assertTrue(encoder.matches(rawPassword, encoded2), "第二次编码应该也能验证");
        assertTrue(encoder.matches(rawPassword, encoded3), "第三次编码应该也能验证");
    }
}


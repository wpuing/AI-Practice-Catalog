package com.example.auth.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * 密码生成工具类
 * 用于生成 BCrypt 加密后的密码
 * 
 * 使用方法：
 * 1. 运行 main 方法
 * 2. 输入要加密的密码（如：123456）
 * 3. 复制输出的 BCrypt 哈希值到数据库
 */
public class PasswordGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // 生成密码 123456 的 BCrypt 哈希
        String password = "123456";
        String hash = encoder.encode(password);
        
        System.out.println("========================================");
        System.out.println("密码: " + password);
        System.out.println("BCrypt 哈希: " + hash);
        System.out.println("========================================");
        System.out.println();
        System.out.println("SQL 更新语句：");
        System.out.println("UPDATE auth_user SET password = '" + hash + "' WHERE username = 'admin';");
        System.out.println();
        
        // 验证生成的哈希
        boolean matches = encoder.matches(password, hash);
        System.out.println("验证结果: " + (matches ? "✓ 匹配" : "✗ 不匹配"));
    }
}


package com.example.demo.interfaces.rest.system;

import com.example.demo.common.result.Result;
import com.example.demo.domain.user.entity.User;
import com.example.demo.application.user.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 测试控制器（用于生成和更新密码）
 * 注意：生产环境应删除此控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    /**
     * 生成新的 BCrypt 密码
     */
    @GetMapping("/generate-password")
    public Result<Map<String, String>> generatePassword(@RequestParam(defaultValue = "123456") String rawPassword) {
        String encodedPassword = passwordEncoder.encode(rawPassword);
        
        Map<String, String> result = new HashMap<>();
        result.put("rawPassword", rawPassword);
        result.put("encodedPassword", encodedPassword);
        result.put("verifyResult", String.valueOf(passwordEncoder.matches(rawPassword, encodedPassword)));
        
        return Result.success(result);
    }

    /**
     * 更新指定用户的密码
     */
    @PostMapping("/update-password")
    public Result<String> updatePassword(
            @RequestParam String username,
            @RequestParam(defaultValue = "123456") String newPassword) {
        
        User user = userService.getOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .eq("username", username));
        
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        
        // 生成新密码
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        boolean updated = userService.updateById(user);
        
        if (updated) {
            // 验证新密码
            boolean matches = passwordEncoder.matches(newPassword, encodedPassword);
            return Result.success("密码更新成功", encodedPassword);
        } else {
            return Result.error(500, "密码更新失败");
        }
    }

    /**
     * 验证密码是否正确
     */
    @PostMapping("/verify-password")
    public Result<Map<String, Object>> verifyPassword(
            @RequestParam String username,
            @RequestParam String password) {
        
        User user = userService.getOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .eq("username", username));
        
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        
        boolean matches = passwordEncoder.matches(password, user.getPassword());
        
        Map<String, Object> result = new HashMap<>();
        result.put("username", username);
        result.put("matches", matches);
        result.put("dbPasswordLength", user.getPassword().length());
        result.put("dbPasswordPreview", user.getPassword().substring(0, Math.min(20, user.getPassword().length())));
        
        return Result.success(result);
    }
}


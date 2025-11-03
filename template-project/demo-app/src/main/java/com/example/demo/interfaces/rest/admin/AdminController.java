package com.example.demo.interfaces.rest.admin;

import com.example.demo.application.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 管理员控制器
 * 需要 ADMIN 角色才能访问
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    /**
     * 管理员可以强制删除用户
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> forceDeleteUser(@PathVariable String id) {
        boolean removed = userService.removeById(id);
        Map<String, Object> result = new HashMap<>();
        if (removed) {
            result.put("success", true);
            result.put("message", "用户已被管理员强制删除");
        } else {
            result.put("success", false);
            result.put("message", "删除失败");
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 管理员可以查看所有用户（包括敏感信息）
     */
    @GetMapping("/users/all")
    public ResponseEntity<Map<String, Object>> getAllUsersAsAdmin() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", userService.list());
        result.put("message", "管理员查看所有用户");
        return ResponseEntity.ok(result);
    }

    /**
     * 管理员信息
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getAdminInfo() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "这是管理员专属接口");
        result.put("data", "管理员可以执行所有操作");
        return ResponseEntity.ok(result);
    }
}


package com.example.demo.interfaces.rest.user;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.domain.user.entity.User;
import com.example.demo.application.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 创建用户
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody User user) {
        // 检查用户名是否已存在
        User existingUser = userService.getOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .eq("username", user.getUsername()));
        if (existingUser != null) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "用户名已存在");
            return ResponseEntity.badRequest().body(result);
        }

        // 加密密码
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        boolean saved = userService.save(user);
        Map<String, Object> result = new HashMap<>();
        if (saved) {
            result.put("success", true);
            result.put("message", "用户创建成功");
            result.put("data", user);
            return ResponseEntity.ok(result);
        } else {
            result.put("success", false);
            result.put("message", "用户创建失败");
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * 根据ID查询用户
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable String id) {
        User user = userService.getById(id);
        Map<String, Object> result = new HashMap<>();
        if (user != null) {
            result.put("success", true);
            result.put("data", user);
            return ResponseEntity.ok(result);
        } else {
            result.put("success", false);
            result.put("message", "用户不存在");
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 查询所有用户
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size) {
        Page<User> page = new Page<>(current, size);
        Page<User> userPage = userService.page(page);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", userPage.getRecords());
        result.put("total", userPage.getTotal());
        result.put("current", userPage.getCurrent());
        result.put("size", userPage.getSize());
        return ResponseEntity.ok(result);
    }

    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable String id, @RequestBody User user) {
        user.setId(id);
        
        // 如果提供了新密码，则加密
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            // 如果没有提供密码，则保留原密码（不更新密码字段）
            User existingUser = userService.getById(id);
            if (existingUser != null) {
                user.setPassword(existingUser.getPassword());
            }
        }

        boolean updated = userService.updateById(user);
        Map<String, Object> result = new HashMap<>();
        if (updated) {
            result.put("success", true);
            result.put("message", "用户更新成功");
            result.put("data", user);
            return ResponseEntity.ok(result);
        } else {
            result.put("success", false);
            result.put("message", "用户更新失败");
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String id) {
        boolean removed = userService.removeById(id);
        Map<String, Object> result = new HashMap<>();
        if (removed) {
            result.put("success", true);
            result.put("message", "用户删除成功");
            return ResponseEntity.ok(result);
        } else {
            result.put("success", false);
            result.put("message", "用户删除失败");
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * 根据用户名查询
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchUsers(@RequestParam String username) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.like("username", username);
        List<User> users = userService.list(queryWrapper);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", users);
        return ResponseEntity.ok(result);
    }
}


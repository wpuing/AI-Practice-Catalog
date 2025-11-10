package com.example.demo.interfaces.rest.user;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.domain.user.entity.User;
import com.example.demo.application.user.UserService;
import com.example.demo.application.role.UserRoleService;
import com.example.demo.infrastructure.cache.RoleCacheService;
import com.example.demo.domain.role.repository.RoleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRoleService userRoleService;

    @Autowired
    private RoleCacheService roleCacheService;

    @Autowired
    private RoleMapper roleMapper;

    /**
     * 创建用户
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody User user) {
        // 获取当前用户角色
        org.springframework.security.core.Authentication authentication = 
            SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
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
        
        // 如果是普通管理员创建用户，默认分配 USER 角色
        if (saved && !isSuperAdmin) {
            // 查找 USER 角色ID并分配
            com.example.demo.domain.role.entity.Role userRole = roleMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.example.demo.domain.role.entity.Role>()
                    .eq("role_code", "USER"));
            if (userRole != null) {
                userRoleService.assignRoleToUser(user.getId(), userRole.getId());
            }
        }
        
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
     * 查询所有用户（根据当前用户角色过滤）
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        // 获取当前用户角色
        org.springframework.security.core.Authentication authentication = 
            SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        Page<User> page = new Page<>(current, size);
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        
        // 如果有关键词，添加查询条件
        if (keyword != null && !keyword.trim().isEmpty()) {
            queryWrapper.like("username", keyword.trim());
        }
        
        Page<User> userPage = userService.page(page, queryWrapper);
        
        // 如果是普通管理员，只返回 USER 角色的用户
        if (!isSuperAdmin) {
            // 先应用关键词过滤，再应用角色过滤
            QueryWrapper<User> adminQueryWrapper = new QueryWrapper<>();
            if (keyword != null && !keyword.trim().isEmpty()) {
                adminQueryWrapper.like("username", keyword.trim());
            }
            List<User> allUsers = userService.list(adminQueryWrapper);
            
            List<User> filteredUsers = allUsers.stream()
                .filter(user -> {
                    List<String> userRoles = roleCacheService.getUserRoles(user.getId());
                    // 只返回只有 USER 角色的用户（不能有 ADMIN 或 SUPER_ADMIN 角色）
                    return userRoles.stream().allMatch(role -> "USER".equals(role));
                })
                .collect(Collectors.toList());
            
            // 分页处理
            int start = (current - 1) * size;
            int end = Math.min(start + size, filteredUsers.size());
            List<User> pagedUsers = start < filteredUsers.size() 
                ? filteredUsers.subList(start, end) 
                : new ArrayList<>();
            
            // 重新计算分页信息
            long totalFiltered = filteredUsers.size();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", pagedUsers);
            result.put("total", totalFiltered);
            result.put("current", current);
            result.put("size", size);
            return ResponseEntity.ok(result);
        }
        
        // 超级管理员返回所有用户
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
        // 获取当前用户角色
        org.springframework.security.core.Authentication authentication = 
            SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        // 检查要更新的用户是否可以被当前用户管理
        if (!isSuperAdmin) {
            List<String> targetUserRoles = roleCacheService.getUserRoles(id);
            // 普通管理员只能更新 USER 角色的用户
            boolean canManage = targetUserRoles.stream().allMatch(role -> "USER".equals(role));
            if (!canManage) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "您只能修改普通用户");
                return ResponseEntity.status(403).body(result);
            }
        }
        
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
        // 获取当前用户角色
        org.springframework.security.core.Authentication authentication = 
            SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        // 检查要删除的用户是否可以被当前用户管理
        if (!isSuperAdmin) {
            List<String> targetUserRoles = roleCacheService.getUserRoles(id);
            // 普通管理员只能删除 USER 角色的用户
            boolean canManage = targetUserRoles.stream().allMatch(role -> "USER".equals(role));
            if (!canManage) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "您只能删除普通用户");
                return ResponseEntity.status(403).body(result);
            }
        }
        
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


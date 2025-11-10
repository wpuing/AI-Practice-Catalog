package com.example.demo.interfaces.rest.role;

import com.example.demo.common.result.Result;
import com.example.demo.domain.role.entity.Role;
import com.example.demo.application.role.RoleService;
import com.example.demo.application.role.UserRoleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 角色管理控制器
 * 需要管理员权限
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/roles")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @Autowired
    private UserRoleService userRoleService;

    /**
     * 获取所有角色（根据当前用户角色过滤）
     */
    @GetMapping
    public Result<List<Role>> getAllRoles(@RequestParam(required = false) String keyword) {
        List<Role> allRoles = roleService.getAllRoles();
        
        // 如果有关键词，先进行过滤
        if (keyword != null && !keyword.trim().isEmpty()) {
            String keywordLower = keyword.trim().toLowerCase();
            allRoles = allRoles.stream()
                .filter(role -> 
                    (role.getRoleName() != null && role.getRoleName().toLowerCase().contains(keywordLower)) ||
                    (role.getRoleCode() != null && role.getRoleCode().toLowerCase().contains(keywordLower)) ||
                    (role.getDescription() != null && role.getDescription().toLowerCase().contains(keywordLower))
                )
                .collect(java.util.stream.Collectors.toList());
        }
        
        // 获取当前用户角色
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        // 如果是超级管理员，返回所有角色；如果是普通管理员，只返回USER角色
        if (isSuperAdmin) {
            return Result.success(allRoles);
        } else {
            // 普通管理员只能看到和管理USER角色
            List<Role> filteredRoles = allRoles.stream()
                .filter(role -> "USER".equals(role.getRoleCode()))
                .collect(java.util.stream.Collectors.toList());
            return Result.success(filteredRoles);
        }
    }

    /**
     * 根据ID获取角色
     */
    @GetMapping("/{id}")
    public Result<Role> getRoleById(@PathVariable String id) {
        Role role = roleService.getRoleById(id);
        if (role == null) {
            return Result.error(404, "角色不存在");
        }
        return Result.success(role);
    }

    /**
     * 创建角色
     */
    @PostMapping
    public Result<Role> createRole(@RequestBody Role role) {
        if (role.getRoleCode() == null || role.getRoleCode().trim().isEmpty()) {
            return Result.error(400, "角色代码不能为空");
        }

        // 获取当前用户角色
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        String roleCode = role.getRoleCode().trim();
        
        // 普通管理员只能创建USER角色
        if (!isSuperAdmin && !"USER".equals(roleCode)) {
            return Result.error(403, "您只能创建普通用户角色");
        }
        
        // 超级管理员不能创建SUPER_ADMIN角色（只能通过数据库初始化）
        if ("SUPER_ADMIN".equals(roleCode)) {
            return Result.error(403, "不能创建超级管理员角色");
        }

        // 检查角色代码是否已存在
        Role existingRole = roleService.getRoleByCode(roleCode);
        if (existingRole != null) {
            return Result.error(400, "角色代码已存在");
        }

        role.setRoleCode(roleCode);
        boolean saved = roleService.saveRole(role);
        if (saved) {
            log.info(String.format("创建角色: roleCode=%s", role.getRoleCode()));
            return Result.success("创建成功", role);
        } else {
            return Result.error(500, "创建失败");
        }
    }

    /**
     * 更新角色
     */
    @PutMapping("/{id}")
    public Result<Role> updateRole(@PathVariable String id, @RequestBody Role role) {
        Role existing = roleService.getRoleById(id);
        if (existing == null) {
            return Result.error(404, "角色不存在");
        }

        // 获取当前用户角色
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        // 普通管理员只能更新USER角色
        if (!isSuperAdmin && !"USER".equals(existing.getRoleCode())) {
            return Result.error(403, "您只能修改普通用户角色");
        }
        
        // 不能修改SUPER_ADMIN角色
        if ("SUPER_ADMIN".equals(existing.getRoleCode())) {
            return Result.error(403, "不能修改超级管理员角色");
        }

        role.setId(id);
        if (role.getRoleCode() != null) {
            String roleCode = role.getRoleCode().trim();
            // 普通管理员不能将角色代码改为非USER
            if (!isSuperAdmin && !"USER".equals(roleCode)) {
                return Result.error(403, "您只能将角色代码设置为USER");
            }
            role.setRoleCode(roleCode);
        }

        boolean updated = roleService.updateRole(role);
        if (updated) {
            log.info(String.format("更新角色: id=%s, roleCode=%s", id, role.getRoleCode()));
            return Result.success("更新成功", roleService.getRoleById(id));
        } else {
            return Result.error(500, "更新失败");
        }
    }

    /**
     * 删除角色
     */
    @DeleteMapping("/{id}")
    public Result<String> deleteRole(@PathVariable String id) {
        Role role = roleService.getRoleById(id);
        if (role == null) {
            return Result.error(404, "角色不存在");
        }

        // 获取当前用户角色
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        // 普通管理员只能删除USER角色
        if (!isSuperAdmin && !"USER".equals(role.getRoleCode())) {
            return Result.error(403, "您只能删除普通用户角色");
        }
        
        // 不能删除SUPER_ADMIN和ADMIN角色
        if ("SUPER_ADMIN".equals(role.getRoleCode()) || "ADMIN".equals(role.getRoleCode())) {
            return Result.error(403, "不能删除系统内置角色");
        }

        boolean deleted = roleService.deleteRole(id);
        if (deleted) {
            log.info(String.format("删除角色: id=%s, roleCode=%s", id, role.getRoleCode()));
            return Result.success("删除成功");
        } else {
            return Result.error(500, "删除失败");
        }
    }

    /**
     * 给用户分配角色
     */
    @PostMapping("/assign")
    public Result<String> assignRoles(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        @SuppressWarnings("unchecked")
        List<String> roleIds = (List<String>) request.get("roleIds");

        if (userId == null || userId.trim().isEmpty()) {
            return Result.error(400, "用户ID不能为空");
        }
        if (roleIds == null || roleIds.isEmpty()) {
            return Result.error(400, "角色ID列表不能为空");
        }

        // 获取当前用户角色
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        // 检查要分配的角色是否合法
        List<Role> rolesToAssign = roleIds.stream()
            .map(roleService::getRoleById)
            .filter(role -> role != null)
            .collect(java.util.stream.Collectors.toList());
        
        // 普通管理员只能分配USER角色
        if (!isSuperAdmin) {
            for (Role role : rolesToAssign) {
                if (!"USER".equals(role.getRoleCode())) {
                    return Result.error(403, "您只能为用户分配普通用户角色");
                }
            }
        }
        
        // 超级管理员不能给用户分配SUPER_ADMIN角色（只能通过数据库）
        if (isSuperAdmin) {
            for (Role role : rolesToAssign) {
                if ("SUPER_ADMIN".equals(role.getRoleCode())) {
                    return Result.error(403, "不能通过接口分配超级管理员角色");
                }
            }
        }

        boolean success = userRoleService.batchSaveUserRoles(userId, roleIds);
        if (success) {
            log.info(String.format("分配用户角色: userId=%s, roleIds=%s", userId, roleIds));
            return Result.success("分配成功");
        } else {
            return Result.error(500, "分配失败");
        }
    }

    /**
     * 获取用户的角色列表（返回角色代码）
     */
    @GetMapping("/user/{userId}")
    public Result<List<String>> getUserRoles(@PathVariable String userId) {
        List<String> roleCodes = userRoleService.getRoleCodesByUserId(userId);
        return Result.success(roleCodes);
    }

    /**
     * 获取用户的角色列表（返回完整角色对象）
     */
    @GetMapping("/user/{userId}/details")
    public Result<List<Role>> getUserRoleDetails(@PathVariable String userId) {
        List<Role> roles = userRoleService.getRolesByUserId(userId);
        return Result.success(roles);
    }

    /**
     * 移除用户的角色
     */
    @DeleteMapping("/user/{userId}/role/{roleId}")
    public Result<String> removeUserRole(@PathVariable String userId, @PathVariable String roleId) {
        // 获取当前用户角色
        org.springframework.security.core.Authentication authentication = 
            SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        // 检查要移除的角色
        Role role = roleService.getRoleById(roleId);
        if (role == null) {
            return Result.error(404, "角色不存在");
        }
        
        // 普通管理员只能移除USER角色
        if (!isSuperAdmin) {
            if (!"USER".equals(role.getRoleCode())) {
                return Result.error(403, "您只能移除普通用户角色");
            }
        }
        
        // 超级管理员不能移除SUPER_ADMIN角色
        if (isSuperAdmin && "SUPER_ADMIN".equals(role.getRoleCode())) {
            return Result.error(403, "不能通过接口移除超级管理员角色");
        }
        
        boolean success = userRoleService.removeRoleFromUser(userId, roleId);
        if (success) {
            log.info(String.format("移除用户角色: userId=%s, roleId=%s", userId, roleId));
            return Result.success("移除成功");
        } else {
            return Result.error(500, "移除失败");
        }
    }

    /**
     * 刷新用户角色缓存
     */
    @PostMapping("/cache/refresh/{userId}")
    public Result<String> refreshUserRoleCache(@PathVariable String userId) {
        userRoleService.getRoleCodesByUserId(userId);  // 触发刷新
        return Result.success("缓存已刷新");
    }

    /**
     * 清除所有角色缓存
     */
    @PostMapping("/cache/clear")
    public Result<String> clearRoleCache() {
        roleService.getAllRoles();  // 触发重新加载并缓存
        return Result.success("缓存已清除并重新加载");
    }
}


package com.example.demo.interfaces.rest.role;

import com.example.demo.common.result.Result;
import com.example.demo.domain.role.entity.Role;
import com.example.demo.application.role.RoleService;
import com.example.demo.application.role.UserRoleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
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
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @Autowired
    private UserRoleService userRoleService;

    /**
     * 获取所有角色
     */
    @GetMapping
    public Result<List<Role>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        return Result.success(roles);
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

        // 检查角色代码是否已存在
        Role existingRole = roleService.getRoleByCode(role.getRoleCode().trim());
        if (existingRole != null) {
            return Result.error(400, "角色代码已存在");
        }

        role.setRoleCode(role.getRoleCode().trim());
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

        role.setId(id);
        if (role.getRoleCode() != null) {
            role.setRoleCode(role.getRoleCode().trim());
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

        boolean success = userRoleService.batchSaveUserRoles(userId, roleIds);
        if (success) {
            log.info(String.format("分配用户角色: userId=%s, roleIds=%s", userId, roleIds));
            return Result.success("分配成功");
        } else {
            return Result.error(500, "分配失败");
        }
    }

    /**
     * 获取用户的角色列表
     */
    @GetMapping("/user/{userId}")
    public Result<List<String>> getUserRoles(@PathVariable String userId) {
        List<String> roleCodes = userRoleService.getRoleCodesByUserId(userId);
        return Result.success(roleCodes);
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


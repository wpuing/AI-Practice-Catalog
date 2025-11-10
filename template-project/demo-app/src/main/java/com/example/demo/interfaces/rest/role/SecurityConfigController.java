package com.example.demo.interfaces.rest.role;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.common.result.Result;
import com.example.demo.domain.security.entity.SecurityPermission;
import com.example.demo.domain.security.entity.SecurityWhitelist;
import com.example.demo.domain.security.repository.SecurityPermissionMapper;
import com.example.demo.domain.security.repository.SecurityWhitelistMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 安全配置管理控制器
 * 用于管理白名单和权限配置（需要管理员权限）
 */
@Slf4j
@RestController
@RequestMapping("/api/security/config")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class SecurityConfigController {

    @Autowired
    private SecurityWhitelistMapper whitelistMapper;

    @Autowired
    private SecurityPermissionMapper permissionMapper;

    // ========== 白名单管理 ==========

    /**
     * 获取所有白名单配置
     */
    @GetMapping("/whitelist")
    public Result<List<SecurityWhitelist>> getAllWhitelist() {
        List<SecurityWhitelist> whitelists = whitelistMapper.selectList(null);
        return Result.success(whitelists);
    }

    /**
     * 根据ID获取白名单配置
     */
    @GetMapping("/whitelist/{id}")
    public Result<SecurityWhitelist> getWhitelistById(@PathVariable String id) {
        SecurityWhitelist whitelist = whitelistMapper.selectById(id);
        if (whitelist == null) {
            return Result.error(404, "白名单配置不存在");
        }
        return Result.success(whitelist);
    }

    /**
     * 创建白名单配置
     */
    @PostMapping("/whitelist")
    public Result<SecurityWhitelist> createWhitelist(@RequestBody SecurityWhitelist whitelist) {
        if (whitelist.getPathPattern() == null || whitelist.getPathPattern().trim().isEmpty()) {
            return Result.error(400, "路径模式不能为空");
        }
        
        whitelist.setPathPattern(whitelist.getPathPattern().trim());
        if (whitelist.getEnabled() == null) {
            whitelist.setEnabled(true);
        }
        if (whitelist.getSortOrder() == null) {
            whitelist.setSortOrder(0);
        }
        // createDate和updateDate由MetaObjectHandler自动填充
        
        boolean saved = whitelistMapper.insert(whitelist) > 0;
        if (saved) {
            log.info(String.format("创建白名单配置: %s", whitelist.getPathPattern()));
            return Result.success("创建成功", whitelist);
        } else {
            return Result.error(500, "创建失败");
        }
    }

    /**
     * 更新白名单配置
     */
    @PutMapping("/whitelist/{id}")
    public Result<SecurityWhitelist> updateWhitelist(@PathVariable String id, @RequestBody SecurityWhitelist whitelist) {
        SecurityWhitelist existing = whitelistMapper.selectById(id);
        if (existing == null) {
            return Result.error(404, "白名单配置不存在");
        }
        
        whitelist.setId(id);
        if (whitelist.getPathPattern() != null) {
            whitelist.setPathPattern(whitelist.getPathPattern().trim());
        }
        // updateDate由MetaObjectHandler自动填充
        
        boolean updated = whitelistMapper.updateById(whitelist) > 0;
        if (updated) {
            log.info(String.format("更新白名单配置: %s", id));
            return Result.success("更新成功", whitelistMapper.selectById(id));
        } else {
            return Result.error(500, "更新失败");
        }
    }

    /**
     * 删除白名单配置
     */
    @DeleteMapping("/whitelist/{id}")
    public Result<String> deleteWhitelist(@PathVariable String id) {
        boolean removed = whitelistMapper.deleteById(id) > 0;
        if (removed) {
            log.info(String.format("删除白名单配置: %s", id));
            return Result.success("删除成功");
        } else {
            return Result.error(404, "白名单配置不存在");
        }
    }

    // ========== 权限管理 ==========

    /**
     * 获取所有权限配置（分页）
     */
    @GetMapping("/permission")
    public Result<IPage<SecurityPermission>> getAllPermissions(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "15") Integer size,
            @RequestParam(required = false) String keyword) {
        Page<SecurityPermission> page = new Page<>(current, size);
        LambdaQueryWrapper<SecurityPermission> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(SecurityPermission::getPathPattern, keyword)
                    .or()
                    .like(SecurityPermission::getDescription, keyword)
                    .or()
                    .like(SecurityPermission::getRequiredRoles, keyword));
        }
        
        wrapper.orderByAsc(SecurityPermission::getSortOrder)
               .orderByAsc(SecurityPermission::getCreateDate);
        
        IPage<SecurityPermission> permissionPage = permissionMapper.selectPage(page, wrapper);
        return Result.success(permissionPage);
    }

    /**
     * 获取所有权限配置（不分页，用于下拉选择等场景）
     */
    @GetMapping("/permission/all")
    public Result<List<SecurityPermission>> getAllPermissionsList() {
        List<SecurityPermission> permissions = permissionMapper.selectList(
                new LambdaQueryWrapper<SecurityPermission>()
                        .orderByAsc(SecurityPermission::getSortOrder)
                        .orderByAsc(SecurityPermission::getCreateDate)
        );
        return Result.success(permissions);
    }

    /**
     * 根据ID获取权限配置
     */
    @GetMapping("/permission/{id}")
    public Result<SecurityPermission> getPermissionById(@PathVariable String id) {
        SecurityPermission permission = permissionMapper.selectById(id);
        if (permission == null) {
            return Result.error(404, "权限配置不存在");
        }
        return Result.success(permission);
    }

    /**
     * 创建权限配置
     */
    @PostMapping("/permission")
    public Result<SecurityPermission> createPermission(@RequestBody SecurityPermission permission) {
        if (permission.getPathPattern() == null || permission.getPathPattern().trim().isEmpty()) {
            return Result.error(400, "路径模式不能为空");
        }
        
        permission.setPathPattern(permission.getPathPattern().trim());
        if (permission.getEnabled() == null) {
            permission.setEnabled(true);
        }
        if (permission.getSortOrder() == null) {
            permission.setSortOrder(0);
        }
        // createDate和updateDate由MetaObjectHandler自动填充
        
        boolean saved = permissionMapper.insert(permission) > 0;
        if (saved) {
            log.info(String.format("创建权限配置: %s", permission.getPathPattern()));
            return Result.success("创建成功", permission);
        } else {
            return Result.error(500, "创建失败");
        }
    }

    /**
     * 更新权限配置
     */
    @PutMapping("/permission/{id}")
    public Result<SecurityPermission> updatePermission(@PathVariable String id, @RequestBody SecurityPermission permission) {
        SecurityPermission existing = permissionMapper.selectById(id);
        if (existing == null) {
            return Result.error(404, "权限配置不存在");
        }
        
        permission.setId(id);
        if (permission.getPathPattern() != null) {
            permission.setPathPattern(permission.getPathPattern().trim());
        }
        // updateDate由MetaObjectHandler自动填充
        
        boolean updated = permissionMapper.updateById(permission) > 0;
        if (updated) {
            log.info(String.format("更新权限配置: %s", id));
            return Result.success("更新成功", permissionMapper.selectById(id));
        } else {
            return Result.error(500, "更新失败");
        }
    }

    /**
     * 删除权限配置
     */
    @DeleteMapping("/permission/{id}")
    public Result<String> deletePermission(@PathVariable String id) {
        boolean removed = permissionMapper.deleteById(id) > 0;
        if (removed) {
            log.info(String.format("删除权限配置: %s", id));
            return Result.success("删除成功");
        } else {
            return Result.error(404, "权限配置不存在");
        }
    }

    /**
     * 刷新安全配置（使配置立即生效）
     * 注意：配置会在下次请求时从数据库重新加载
     */
    @PostMapping("/refresh")
    public Result<String> refreshConfig() {
        log.info("刷新安全配置");
        return Result.success("配置将在下次请求时从数据库重新加载");
    }
}


package com.example.demo.application.menu;

import com.example.demo.domain.menu.entity.MenuPermission;
import com.example.demo.domain.menu.repository.MenuPermissionMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 菜单功能权限服务
 */
@Slf4j
@Service
public class MenuPermissionService {

    @Autowired
    private MenuPermissionMapper menuPermissionMapper;

    /**
     * 根据菜单ID查询功能权限列表
     */
    public List<MenuPermission> getPermissionsByMenuId(String menuId) {
        return menuPermissionMapper.selectByMenuId(menuId);
    }

    /**
     * 根据菜单ID查询安全权限ID列表
     */
    public List<String> getSecurityPermissionIdsByMenuId(String menuId) {
        try {
            log.debug("查询菜单权限ID列表，菜单ID: {}", menuId);
            List<String> permissionIds = menuPermissionMapper.selectSecurityPermissionIdsByMenuId(menuId);
            log.debug("查询到 {} 个权限ID", permissionIds != null ? permissionIds.size() : 0);
            return permissionIds != null ? permissionIds : new java.util.ArrayList<>();
        } catch (Exception e) {
            log.error("查询菜单权限ID列表失败，菜单ID: {}", menuId, e);
            throw new RuntimeException("查询菜单权限ID列表失败: " + e.getMessage(), e);
        }
    }

    /**
     * 为菜单分配安全权限（通过 security_permission ID）
     */
    @Transactional
    public boolean assignPermissionsToMenu(String menuId, List<String> securityPermissionIds) {
        // 先删除该菜单的所有功能权限
        menuPermissionMapper.deleteByMenuId(menuId);

        // 批量插入新的功能权限
        if (securityPermissionIds != null && !securityPermissionIds.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            List<MenuPermission> menuPermissions = new java.util.ArrayList<>();
            for (int i = 0; i < securityPermissionIds.size(); i++) {
                String securityPermissionId = securityPermissionIds.get(i);
                MenuPermission menuPermission = new MenuPermission();
                menuPermission.setMenuId(menuId);
                menuPermission.setSecurityPermissionId(securityPermissionId);
                menuPermission.setEnabled(true);
                menuPermission.setSortOrder(i + 1);
                menuPermission.setCreateDate(now);
                menuPermission.setUpdateDate(now);
                menuPermissions.add(menuPermission);
            }

            if (!menuPermissions.isEmpty()) {
                menuPermissionMapper.insertBatch(menuPermissions);
            }
        }

        return true;
    }
}


package com.example.demo.interfaces.rest.menu;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.common.result.Result;
import com.example.demo.domain.menu.entity.Menu;
import com.example.demo.domain.menu.entity.MenuPermission;
import com.example.demo.application.menu.MenuService;
import com.example.demo.application.menu.MenuPermissionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 菜单管理控制器
 * 需要超级管理员权限
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/menus")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @Autowired
    private MenuPermissionService menuPermissionService;

    /**
     * 获取所有菜单（分页）
     */
    @GetMapping
    public Result<IPage<Menu>> getAllMenus(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "15") Integer size,
            @RequestParam(required = false) String keyword) {
        Page<Menu> page = new Page<>(current, size);
        IPage<Menu> menuPage = menuService.getMenusPage(page, keyword);
        return Result.success(menuPage);
    }

    /**
     * 获取所有菜单（不分页，用于下拉选择等场景）
     */
    @GetMapping("/all")
    public Result<List<Menu>> getAllMenusList() {
        List<Menu> menus = menuService.getAllMenus();
        return Result.success(menus);
    }

    /**
     * 获取所有启用的菜单
     */
    @GetMapping("/enabled")
    public Result<List<Menu>> getAllEnabledMenus() {
        List<Menu> menus = menuService.getAllEnabledMenus();
        return Result.success(menus);
    }

    /**
     * 根据角色ID获取菜单列表
     */
    @GetMapping("/role/{roleId}")
    public Result<List<Menu>> getMenusByRoleId(@PathVariable String roleId) {
        List<Menu> menus = menuService.getMenusByRoleId(roleId);
        return Result.success(menus);
    }

    /**
     * 根据ID获取菜单
     */
    @GetMapping("/{id}")
    public Result<Menu> getMenuById(@PathVariable String id) {
        Menu menu = menuService.getMenuById(id);
        if (menu == null) {
            return Result.error(404, "菜单不存在");
        }
        return Result.success(menu);
    }

    /**
     * 创建菜单
     */
    @PostMapping
    public Result<Menu> createMenu(@RequestBody Menu menu) {
        if (menu.getMenuCode() == null || menu.getMenuCode().trim().isEmpty()) {
            return Result.error(400, "菜单代码不能为空");
        }
        if (menu.getMenuName() == null || menu.getMenuName().trim().isEmpty()) {
            return Result.error(400, "菜单名称不能为空");
        }

        // 检查菜单代码是否已存在
        Menu existing = menuService.getAllMenus().stream()
                .filter(m -> m.getMenuCode().equals(menu.getMenuCode().trim()))
                .findFirst()
                .orElse(null);
        if (existing != null) {
            return Result.error(400, "菜单代码已存在");
        }

        menu.setMenuCode(menu.getMenuCode().trim());
        menu.setMenuName(menu.getMenuName().trim());
        if (menu.getEnabled() == null) {
            menu.setEnabled(true);
        }
        if (menu.getSortOrder() == null) {
            menu.setSortOrder(0);
        }
        if (menu.getMenuType() == null) {
            menu.setMenuType("MENU");
        }

        boolean saved = menuService.saveMenu(menu);
        if (saved) {
            log.info("创建菜单: menuCode={}, menuName={}", menu.getMenuCode(), menu.getMenuName());
            return Result.success("创建成功", menu);
        } else {
            return Result.error(500, "创建失败");
        }
    }

    /**
     * 更新菜单
     */
    @PutMapping("/{id}")
    public Result<Menu> updateMenu(@PathVariable String id, @RequestBody Menu menu) {
        Menu existing = menuService.getMenuById(id);
        if (existing == null) {
            return Result.error(404, "菜单不存在");
        }

        menu.setId(id);
        if (menu.getMenuCode() != null) {
            menu.setMenuCode(menu.getMenuCode().trim());
        }
        if (menu.getMenuName() != null) {
            menu.setMenuName(menu.getMenuName().trim());
        }

        boolean updated = menuService.updateMenu(menu);
        if (updated) {
            log.info("更新菜单: id={}, menuCode={}", id, menu.getMenuCode());
            return Result.success("更新成功", menuService.getMenuById(id));
        } else {
            return Result.error(500, "更新失败");
        }
    }

    /**
     * 删除菜单
     */
    @DeleteMapping("/{id}")
    public Result<String> deleteMenu(@PathVariable String id) {
        Menu menu = menuService.getMenuById(id);
        if (menu == null) {
            return Result.error(404, "菜单不存在");
        }

        boolean deleted = menuService.deleteMenu(id);
        if (deleted) {
            log.info("删除菜单: id={}, menuCode={}", id, menu.getMenuCode());
            return Result.success("删除成功");
        } else {
            return Result.error(500, "删除失败");
        }
    }

    /**
     * 为角色分配菜单
     */
    @PostMapping("/assign")
    public Result<String> assignMenusToRole(@RequestBody Map<String, Object> request) {
        String roleId = (String) request.get("roleId");
        @SuppressWarnings("unchecked")
        List<String> menuIds = (List<String>) request.get("menuIds");

        if (roleId == null || roleId.trim().isEmpty()) {
            return Result.error(400, "角色ID不能为空");
        }

        boolean success = menuService.assignMenusToRole(roleId, menuIds);
        if (success) {
            log.info("分配角色菜单: roleId={}, menuIds={}", roleId, menuIds);
            return Result.success("分配成功");
        } else {
            return Result.error(500, "分配失败");
        }
    }

    /**
     * 获取角色的菜单ID列表
     */
    @GetMapping("/role/{roleId}/menu-ids")
    public Result<List<String>> getMenuIdsByRoleId(@PathVariable String roleId) {
        List<String> menuIds = menuService.getMenuIdsByRoleId(roleId);
        return Result.success(menuIds);
    }

    /**
     * 根据菜单ID获取功能权限列表
     */
    @GetMapping("/{menuId}/permissions")
    public Result<List<MenuPermission>> getMenuPermissions(@PathVariable String menuId) {
        List<MenuPermission> permissions = menuPermissionService.getPermissionsByMenuId(menuId);
        return Result.success(permissions);
    }

    /**
     * 根据菜单ID获取安全权限ID列表
     */
    @GetMapping("/{menuId}/permission-ids")
    public Result<List<String>> getMenuPermissionIds(@PathVariable String menuId) {
        try {
            List<String> permissionIds = menuPermissionService.getSecurityPermissionIdsByMenuId(menuId);
            return Result.success(permissionIds);
        } catch (Exception e) {
            log.error("获取菜单权限ID列表失败，菜单ID: {}", menuId, e);
            return Result.error("获取菜单权限ID列表失败: " + e.getMessage());
        }
    }

    /**
     * 为菜单分配安全权限（通过 security_permission ID）
     */
    @PostMapping("/{menuId}/permissions")
    public Result<String> assignPermissionsToMenu(@PathVariable String menuId, @RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> securityPermissionIds = (List<String>) request.get("securityPermissionIds");

        if (securityPermissionIds == null) {
            return Result.error(400, "安全权限ID列表不能为空");
        }

        boolean success = menuPermissionService.assignPermissionsToMenu(menuId, securityPermissionIds);
        if (success) {
            log.info("分配菜单安全权限: menuId={}, securityPermissionIds={}", menuId, securityPermissionIds);
            return Result.success("分配成功");
        } else {
            return Result.error(500, "分配失败");
        }
    }
}


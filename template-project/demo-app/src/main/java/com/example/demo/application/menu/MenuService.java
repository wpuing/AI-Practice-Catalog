package com.example.demo.application.menu;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.domain.menu.entity.Menu;
import com.example.demo.domain.menu.entity.RoleMenu;
import com.example.demo.domain.menu.repository.MenuMapper;
import com.example.demo.domain.menu.repository.MenuPermissionMapper;
import com.example.demo.domain.menu.repository.RoleMenuMapper;
import com.example.demo.domain.role.entity.Role;
import com.example.demo.domain.role.repository.RoleMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 菜单服务
 */
@Slf4j
@Service
public class MenuService {

    @Autowired
    private MenuMapper menuMapper;

    @Autowired
    private RoleMenuMapper roleMenuMapper;

    @Autowired
    private MenuPermissionMapper menuPermissionMapper;

    @Autowired
    private RoleMapper roleMapper;

    /**
     * 查询所有菜单
     */
    public List<Menu> getAllMenus() {
        return menuMapper.selectList(
                new LambdaQueryWrapper<Menu>()
                        .orderByAsc(Menu::getSortOrder)
                        .orderByAsc(Menu::getCreateDate)
        );
    }

    /**
     * 分页查询菜单
     */
    public IPage<Menu> getMenusPage(Page<Menu> page, String keyword) {
        LambdaQueryWrapper<Menu> wrapper = new LambdaQueryWrapper<Menu>()
                .orderByAsc(Menu::getSortOrder)
                .orderByAsc(Menu::getCreateDate);
        
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Menu::getMenuName, keyword)
                    .or()
                    .like(Menu::getMenuCode, keyword)
                    .or()
                    .like(Menu::getPath, keyword)
                    .or()
                    .like(Menu::getDescription, keyword));
        }
        
        return menuMapper.selectPage(page, wrapper);
    }

    /**
     * 查询所有启用的菜单
     */
    public List<Menu> getAllEnabledMenus() {
        return menuMapper.selectAllEnabledMenus();
    }

    /**
     * 根据角色ID查询菜单列表
     */
    public List<Menu> getMenusByRoleId(String roleId) {
        return menuMapper.selectMenusByRoleId(roleId);
    }

    /**
     * 根据用户角色代码列表查询菜单列表（合并多个角色的菜单）
     */
    public List<Menu> getMenusByRoleCodes(List<String> roleCodes) {
        if (roleCodes == null || roleCodes.isEmpty()) {
            return List.of();
        }
        
        // 检查是否有超级管理员角色
        boolean hasSuperAdmin = roleCodes.contains("SUPER_ADMIN");
        
        // 如果是超级管理员，返回所有菜单
        if (hasSuperAdmin) {
            return getAllEnabledMenus();
        }
        
        // 根据角色代码查询角色ID列表
        List<String> roleIds = roleCodes.stream()
                .map(roleCode -> {
                    Role role = roleMapper.selectOne(
                            new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Role>()
                                    .eq("role_code", roleCode));
                    return role != null ? role.getId() : null;
                })
                .filter(roleId -> roleId != null)
                .collect(Collectors.toList());
        
        if (roleIds.isEmpty()) {
            return List.of();
        }
        
        // 根据角色ID列表查询菜单（合并去重）
        return getMenusByRoleIds(roleIds);
    }
    
    /**
     * 根据用户角色ID列表查询菜单列表（合并多个角色的菜单）
     */
    public List<Menu> getMenusByRoleIds(List<String> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return List.of();
        }
        
        // 合并所有角色的菜单（去重）
        return roleIds.stream()
                .flatMap(roleId -> getMenusByRoleId(roleId).stream())
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * 根据ID查询菜单
     */
    public Menu getMenuById(String menuId) {
        return menuMapper.selectById(menuId);
    }

    /**
     * 保存菜单
     */
    @Transactional
    public boolean saveMenu(Menu menu) {
        // createDate和updateDate由MetaObjectHandler自动填充
        return menuMapper.insert(menu) > 0;
    }

    /**
     * 更新菜单
     */
    @Transactional
    public boolean updateMenu(Menu menu) {
        // updateDate由MetaObjectHandler自动填充
        return menuMapper.updateById(menu) > 0;
    }

    /**
     * 删除菜单
     */
    @Transactional
    public boolean deleteMenu(String menuId) {
        // 删除角色菜单关联
        roleMenuMapper.delete(
                new LambdaQueryWrapper<RoleMenu>()
                        .eq(RoleMenu::getMenuId, menuId)
        );
        // 删除菜单功能权限关联
        menuPermissionMapper.deleteByMenuId(menuId);
        // 删除菜单
        return menuMapper.deleteById(menuId) > 0;
    }

    /**
     * 为角色分配菜单
     */
    @Transactional
    public boolean assignMenusToRole(String roleId, List<String> menuIds) {
        // 先删除该角色的所有菜单关联
        roleMenuMapper.deleteByRoleId(roleId);
        
        // 批量插入新的菜单关联
        if (menuIds != null && !menuIds.isEmpty()) {
            List<RoleMenu> roleMenus = menuIds.stream()
                    .map(menuId -> {
                        RoleMenu roleMenu = new RoleMenu();
                        roleMenu.setRoleId(roleId);
                        roleMenu.setMenuId(menuId);
                        return roleMenu;
                    })
                    .collect(Collectors.toList());
            roleMenuMapper.insertBatch(roleMenus);
        }
        
        return true;
    }

    /**
     * 根据角色ID查询菜单ID列表
     */
    public List<String> getMenuIdsByRoleId(String roleId) {
        return roleMenuMapper.selectMenuIdsByRoleId(roleId);
    }
}


package com.example.demo.application.role;

import com.example.demo.domain.role.entity.Role;
import com.example.demo.domain.role.repository.RoleMapper;
import com.example.demo.domain.user.entity.UserRole;
import com.example.demo.domain.user.repository.UserRoleMapper;
import com.example.demo.infrastructure.cache.RoleCacheService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 用户角色关联服务
 * 提供用户角色关联的CRUD操作，并在更新时同步Redis缓存
 */
@Slf4j
@Service
public class UserRoleService {

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private RoleCacheService roleCacheService;

    /**
     * 保存用户角色关联
     * 先保存到数据库，然后同步更新Redis缓存
     */
    @Transactional
    public boolean saveUserRole(UserRole userRole) {
        boolean saved = userRoleMapper.insert(userRole) > 0;
        if (saved) {
            // 刷新该用户的角色缓存
            roleCacheService.refreshUserRolesCache(userRole.getUserId());
            log.info(String.format("保存用户角色关联并更新缓存: userId=%s, roleId=%s", 
                userRole.getUserId(), userRole.getRoleId()));
        }
        return saved;
    }

    /**
     * 删除用户角色关联
     * 先删除数据库记录，然后同步更新Redis缓存
     */
    @Transactional
    public boolean deleteUserRole(String userRoleId) {
        UserRole userRole = userRoleMapper.selectById(userRoleId);
        boolean deleted = userRoleMapper.deleteById(userRoleId) > 0;
        if (deleted && userRole != null) {
            // 刷新该用户的角色缓存
            roleCacheService.refreshUserRolesCache(userRole.getUserId());
            log.info(String.format("删除用户角色关联并更新缓存: userId=%s, roleId=%s", 
                userRole.getUserId(), userRole.getRoleId()));
        }
        return deleted;
    }

    /**
     * 根据用户ID删除所有角色关联
     * 先删除数据库记录，然后清除Redis缓存
     */
    @Transactional
    public boolean deleteUserRolesByUserId(String userId) {
        boolean deleted = userRoleMapper.delete(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserRole>()
                        .eq("user_id", userId)) > 0;
        if (deleted) {
            // 清除该用户的角色缓存
            roleCacheService.evictUserRoles(userId);
            log.info(String.format("删除用户所有角色关联并清除缓存: userId=%s", userId));
        }
        return deleted;
    }

    /**
     * 根据角色ID删除所有用户关联
     * 先删除数据库记录，然后清除相关用户的Redis缓存
     */
    @Transactional
    public boolean deleteUserRolesByRoleId(String roleId) {
        // 先查询所有关联的用户ID
        List<UserRole> userRoles = userRoleMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserRole>()
                        .eq("role_id", roleId));
        
        boolean deleted = userRoleMapper.delete(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserRole>()
                        .eq("role_id", roleId)) > 0;
        
        if (deleted) {
            // 刷新所有相关用户的角色缓存
            for (UserRole userRole : userRoles) {
                roleCacheService.refreshUserRolesCache(userRole.getUserId());
            }
            log.info(String.format("删除角色所有用户关联并更新缓存: roleId=%s, 影响用户数=%d", 
                roleId, userRoles.size()));
        }
        return deleted;
    }

    /**
     * 批量保存用户角色关联
     */
    @Transactional
    public boolean batchSaveUserRoles(String userId, List<String> roleIds) {
        // 先删除该用户的所有角色关联
        deleteUserRolesByUserId(userId);
        
        // 批量保存新的角色关联
        for (String roleId : roleIds) {
            UserRole userRole = new UserRole();
            userRole.setUserId(userId);
            userRole.setRoleId(roleId);
            userRoleMapper.insert(userRole);
        }
        
        // 刷新该用户的角色缓存
        roleCacheService.refreshUserRolesCache(userId);
        
        log.info(String.format("批量保存用户角色关联并更新缓存: userId=%s, roleIds=%s", userId, roleIds));
        return true;
    }

    /**
     * 根据用户ID查询角色列表
     */
    public List<Role> getRolesByUserId(String userId) {
        return roleMapper.findRolesByUserId(userId);
    }

    /**
     * 根据用户ID查询角色代码列表（优先从缓存获取）
     */
    public List<String> getRoleCodesByUserId(String userId) {
        return roleCacheService.getUserRoles(userId);
    }

    /**
     * 为用户分配角色
     */
    @Transactional
    public boolean assignRoleToUser(String userId, String roleId) {
        UserRole userRole = new UserRole();
        userRole.setUserId(userId);
        userRole.setRoleId(roleId);
        return saveUserRole(userRole);
    }

    /**
     * 移除用户的角色
     */
    @Transactional
    public boolean removeRoleFromUser(String userId, String roleId) {
        boolean deleted = userRoleMapper.delete(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserRole>()
                        .eq("user_id", userId)
                        .eq("role_id", roleId)) > 0;
        if (deleted) {
            roleCacheService.refreshUserRolesCache(userId);
        }
        return deleted;
    }

    /**
     * 批量为用户分配角色
     */
    @Transactional
    public boolean batchAssignRoles(String userId, List<String> roleIds) {
        return batchSaveUserRoles(userId, roleIds);
    }
}


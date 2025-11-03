package com.example.demo.application.role;

import com.example.demo.domain.role.entity.Role;
import com.example.demo.domain.role.repository.RoleMapper;
import com.example.demo.infrastructure.cache.RoleCacheService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 角色服务
 * 提供角色的CRUD操作，并在更新时同步Redis缓存
 */
@Slf4j
@Service
public class RoleService {

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private RoleCacheService roleCacheService;

    /**
     * 保存角色
     * 先保存到数据库，然后同步更新Redis缓存
     */
    @Transactional
    public boolean saveRole(Role role) {
        boolean saved = roleMapper.insert(role) > 0;
        if (saved) {
            // 更新Redis缓存
            roleCacheService.cacheAllRoles();
            log.info(String.format("保存角色并更新缓存: roleCode=%s", role.getRoleCode()));
        }
        return saved;
    }

    /**
     * 更新角色
     * 先更新数据库，然后同步更新Redis缓存
     */
    @Transactional
    public boolean updateRole(Role role) {
        boolean updated = roleMapper.updateById(role) > 0;
        if (updated) {
            // 清除所有角色缓存，让系统重新加载
            roleCacheService.evictAllRolesCache();
            roleCacheService.cacheAllRoles();
            
            // 清除所有用户角色缓存，因为角色信息可能已变更
            roleCacheService.evictAllUserRolesCache();
            log.info(String.format("更新角色并同步缓存: roleCode=%s", role.getRoleCode()));
        }
        return updated;
    }

    /**
     * 删除角色
     * 先删除数据库记录，然后清除相关缓存
     */
    @Transactional
    public boolean deleteRole(String roleId) {
        Role role = roleMapper.selectById(roleId);
        boolean deleted = roleMapper.deleteById(roleId) > 0;
        if (deleted) {
            // 清除所有角色缓存
            roleCacheService.evictAllRolesCache();
            roleCacheService.cacheAllRoles();
            
            // 清除所有用户角色缓存，因为角色已删除
            roleCacheService.evictAllUserRolesCache();
            
            if (role != null) {
                log.info(String.format("删除角色并清除缓存: roleCode=%s", role.getRoleCode()));
            }
        }
        return deleted;
    }

    /**
     * 查询所有角色（优先从缓存获取）
     */
    public List<Role> getAllRoles() {
        // 先从缓存获取
        List<Role> cachedRoles = roleCacheService.getAllRolesFromCache();
        if (cachedRoles != null) {
            return cachedRoles;
        }
        
        // 缓存不存在，从数据库获取
        List<Role> roles = roleMapper.selectList(null);
        // 缓存到Redis
        roleCacheService.cacheAllRoles();
        return roles;
    }

    /**
     * 根据ID查询角色
     */
    public Role getRoleById(String roleId) {
        return roleMapper.selectById(roleId);
    }

    /**
     * 根据角色代码查询角色
     */
    public Role getRoleByCode(String roleCode) {
        return roleMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Role>()
                        .eq("role_code", roleCode));
    }
}


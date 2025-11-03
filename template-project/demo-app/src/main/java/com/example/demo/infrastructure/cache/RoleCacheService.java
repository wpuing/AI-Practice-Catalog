package com.example.demo.infrastructure.cache;

import com.example.demo.common.constants.LogMessages;
import com.example.demo.common.constants.RedisKeyConstants;
import com.example.demo.domain.role.entity.Role;
import com.example.demo.domain.role.repository.RoleMapper;
import com.example.demo.domain.user.repository.UserRoleMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 角色缓存服务
 * 负责将用户角色信息缓存到Redis中，提高查询性能
 */
@Slf4j
@Service
public class RoleCacheService {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    private final ObjectMapper objectMapper;

    public RoleCacheService() {
        this.objectMapper = new ObjectMapper();
        // 配置ObjectMapper支持Java 8时间类型
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /**
     * 角色过期时间（秒），默认7天
     */
    @Value("${role.cache.expire-time:604800}")
    private long expireTime;

    /**
     * 缓存用户的所有角色
     * @param userId 用户ID
     * @param roles 角色列表
     */
    public void cacheUserRoles(String userId, List<Role> roles) {
        try {
            String key = RedisKeyConstants.getUserRolesKey(userId);
            List<String> roleCodes = roles.stream()
                    .map(Role::getRoleCode)
                    .collect(Collectors.toList());
            
            String roleCodesJson = objectMapper.writeValueAsString(roleCodes);
            redisTemplate.opsForValue().set(key, roleCodesJson, expireTime, TimeUnit.SECONDS);
            
            log.debug(String.format(LogMessages.RoleCache.CACHE_USER_ROLES, userId, roleCodes));
        } catch (Exception e) {
            log.error(String.format(LogMessages.RoleCache.CACHE_USER_ROLES_FAILED, userId, e.getMessage()), e);
        }
    }

    /**
     * 从Redis获取用户的所有角色代码
     * @param userId 用户ID
     * @return 角色代码列表，如果缓存不存在则返回null
     */
    public List<String> getUserRolesFromCache(String userId) {
        try {
            String key = RedisKeyConstants.getUserRolesKey(userId);
            String roleCodesJson = redisTemplate.opsForValue().get(key);
            
            if (roleCodesJson == null || roleCodesJson.isEmpty()) {
                return null;
            }

            return objectMapper.readValue(roleCodesJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.error(String.format(LogMessages.RoleCache.CACHE_USER_ROLES_FAILED, userId, e.getMessage()), e);
            return null;
        }
    }

    /**
     * 删除用户角色缓存
     * @param userId 用户ID
     */
    public void evictUserRoles(String userId) {
        try {
            String key = RedisKeyConstants.getUserRolesKey(userId);
            redisTemplate.delete(key);
            log.debug(String.format(LogMessages.RoleCache.DELETE_USER_ROLES, userId));
        } catch (Exception e) {
            log.error(String.format(LogMessages.RoleCache.DELETE_USER_ROLES_FAILED, userId, e.getMessage()), e);
        }
    }

    /**
     * 获取用户角色（优先从缓存获取，缓存不存在则从数据库获取并缓存）
     * @param userId 用户ID
     * @return 角色代码列表
     */
    public List<String> getUserRoles(String userId) {
            // 先从缓存获取
            List<String> cachedRoles = getUserRolesFromCache(userId);
            if (cachedRoles != null) {
                log.debug(String.format(LogMessages.RoleCache.GET_FROM_CACHE, userId, cachedRoles));
                return cachedRoles;
            }

            // 缓存不存在，从数据库获取
            log.info(String.format(LogMessages.RoleCache.CACHE_MISS, userId));
        List<Role> roles = roleMapper.findRolesByUserId(userId);
        List<String> roleCodes = roles.stream()
                .map(Role::getRoleCode)
                .collect(Collectors.toList());

        // 缓存到Redis
        cacheUserRoles(userId, roles);
        log.info(String.format("从数据库加载用户角色并缓存: userId=%s, roles=%s", userId, roleCodes));
        return roleCodes;
    }

    /**
     * 缓存所有角色列表
     */
    public void cacheAllRoles() {
        try {
            List<Role> allRoles = roleMapper.selectList(null);
            String rolesJson = objectMapper.writeValueAsString(allRoles);
            redisTemplate.opsForValue().set(RedisKeyConstants.getAllRolesKey(), rolesJson, expireTime, TimeUnit.SECONDS);
            log.info(String.format(LogMessages.RoleCache.CACHE_ALL_ROLES, allRoles.size()));
        } catch (Exception e) {
            log.error(String.format(LogMessages.RoleCache.CACHE_ALL_ROLES_FAILED, e.getMessage()), e);
        }
    }

    /**
     * 从缓存获取所有角色列表
     */
    public List<Role> getAllRolesFromCache() {
        try {
            String rolesJson = redisTemplate.opsForValue().get(RedisKeyConstants.getAllRolesKey());
            if (rolesJson == null || rolesJson.isEmpty()) {
                return null;
            }

            return objectMapper.readValue(rolesJson, new TypeReference<List<Role>>() {});
        } catch (Exception e) {
            log.error(String.format(LogMessages.RoleCache.CACHE_ALL_ROLES_FAILED, e.getMessage()), e);
            return null;
        }
    }

    /**
     * 清除所有角色缓存
     */
    public void evictAllRolesCache() {
        try {
            redisTemplate.delete(RedisKeyConstants.getAllRolesKey());
            log.info(LogMessages.RoleCache.CLEAR_ALL_ROLES);
        } catch (Exception e) {
            log.error(String.format(LogMessages.RoleCache.CLEAR_ALL_ROLES_FAILED, e.getMessage()), e);
        }
    }

    /**
     * 清除所有用户角色缓存
     */
    public void evictAllUserRolesCache() {
        try {
            Set<String> keys = redisTemplate.keys(RedisKeyConstants.Role.USER_ROLES + "*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info(String.format(LogMessages.RoleCache.CLEAR_ALL_USER_ROLES, keys.size()));
            }
        } catch (Exception e) {
            log.error(String.format(LogMessages.RoleCache.CLEAR_ALL_USER_ROLES_FAILED, e.getMessage()), e);
        }
    }

    /**
     * 初始化所有用户角色缓存
     * 系统启动时调用，将所有用户的角色信息缓存到Redis
     */
    public void initAllUserRolesCache() {
        try {
            log.info(LogMessages.RoleCache.INIT_START);
            
            // 获取所有用户角色关联
            List<com.example.demo.domain.user.entity.UserRole> userRoles = userRoleMapper.selectList(null);
            
            // 按用户ID分组
            java.util.Map<String, List<String>> userRolesMap = userRoles.stream()
                    .collect(Collectors.groupingBy(
                            com.example.demo.domain.user.entity.UserRole::getUserId,
                            Collectors.mapping(com.example.demo.domain.user.entity.UserRole::getRoleId, Collectors.toList())
                    ));

            int cachedCount = 0;
            for (java.util.Map.Entry<String, List<String>> entry : userRolesMap.entrySet()) {
                String userId = entry.getKey();
                List<String> roleIds = entry.getValue();
                
                // 根据角色ID查询角色信息
                List<Role> roles = new ArrayList<>();
                for (String roleId : roleIds) {
                    Role role = roleMapper.selectById(roleId);
                    if (role != null) {
                        roles.add(role);
                    }
                }
                
                // 缓存用户角色
                cacheUserRoles(userId, roles);
                cachedCount++;
            }
            
            // 缓存所有角色列表
            cacheAllRoles();
            
            log.info(String.format(LogMessages.RoleCache.INIT_SUCCESS, cachedCount));
        } catch (Exception e) {
            log.error(String.format(LogMessages.RoleCache.INIT_FAILED, e.getMessage()), e);
        }
    }

    /**
     * 刷新用户角色缓存（从数据库重新加载并缓存）
     * @param userId 用户ID
     */
    public void refreshUserRolesCache(String userId) {
        evictUserRoles(userId);
        List<Role> roles = roleMapper.findRolesByUserId(userId);
        cacheUserRoles(userId, roles);
        log.info(String.format(LogMessages.RoleCache.REFRESH_USER_ROLES, 
            userId, roles.stream().map(Role::getRoleCode).collect(Collectors.toList())));
    }
}


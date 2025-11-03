package com.example.demo.application.role;

import com.example.demo.domain.security.entity.SecurityPermission;
import com.example.demo.domain.security.entity.SecurityWhitelist;
import com.example.demo.domain.security.repository.SecurityPermissionMapper;
import com.example.demo.domain.security.repository.SecurityWhitelistMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 安全配置服务
 * 负责从数据库加载白名单和权限配置
 */
@Slf4j
@Service
public class SecurityConfigService {

    @Autowired
    private SecurityWhitelistMapper whitelistMapper;

    @Autowired
    private SecurityPermissionMapper permissionMapper;

    /**
     * 获取所有启用的白名单配置
     */
    public List<SecurityWhitelist> getAllEnabledWhitelist() {
        try {
            List<SecurityWhitelist> whitelists = whitelistMapper.findAllEnabled();
            log.info(String.format("从数据库加载白名单配置，共 %d 条", whitelists.size()));
            return whitelists;
        } catch (Exception e) {
            log.error(String.format("加载白名单配置失败: %s", e.getMessage()), e);
            return List.of();  // 返回空列表，避免系统崩溃
        }
    }

    /**
     * 获取所有启用的权限配置
     */
    public List<SecurityPermission> getAllEnabledPermissions() {
        try {
            List<SecurityPermission> permissions = permissionMapper.findAllEnabled();
            log.info(String.format("从数据库加载权限配置，共 %d 条", permissions.size()));
            return permissions;
        } catch (Exception e) {
            log.error(String.format("加载权限配置失败: %s", e.getMessage()), e);
            return List.of();  // 返回空列表，避免系统崩溃
        }
    }
}


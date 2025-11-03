package com.example.demo.application.user.impl;

import com.example.demo.domain.user.entity.User;
import com.example.demo.domain.user.repository.UserMapper;
import com.example.demo.infrastructure.cache.RoleCacheService;
import com.example.demo.infrastructure.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoleCacheService roleCacheService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info(String.format("加载用户信息: %s", username));
        
        User user = userMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .eq("username", username));

        if (user == null) {
            log.warn(String.format("用户不存在: %s", username));
            throw new UsernameNotFoundException("用户不存在: " + username);
        }

        log.info(String.format("找到用户: %s, ID: %s, 密码长度: %d", 
            user.getUsername(), user.getId(), 
            user.getPassword() != null ? user.getPassword().length() : 0));

        // 从Redis缓存获取用户角色（优先从缓存获取，缓存不存在则从数据库获取并缓存）
        List<String> roleCodes = roleCacheService.getUserRoles(user.getId());

        log.info(String.format("用户 %s 的角色: %s", username, roleCodes));

        UserDetailsImpl userDetails = new UserDetailsImpl(user, roleCodes);
        return userDetails;
    }
}


package com.example.auth.infrastructure.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.auth.domain.entity.AuthUser;
import com.example.auth.domain.repository.AuthUserRepository;
import com.example.auth.infrastructure.repository.mapper.AuthUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/**
 * 认证用户仓储实现
 */
@Repository
@RequiredArgsConstructor
public class AuthUserRepositoryImpl implements AuthUserRepository {
    private final AuthUserMapper authUserMapper;

    @Override
    public AuthUser findByUsername(String username) {
        return authUserMapper.selectOne(
                new LambdaQueryWrapper<AuthUser>()
                        .eq(AuthUser::getUsername, username)
                        .eq(AuthUser::getDeleted, 0)
        );
    }

    @Override
    public AuthUser findById(String id) {
        return authUserMapper.selectById(id);
    }

    @Override
    public void save(AuthUser user) {
        authUserMapper.insert(user);
    }

    @Override
    public void update(AuthUser user) {
        authUserMapper.updateById(user);
    }
}


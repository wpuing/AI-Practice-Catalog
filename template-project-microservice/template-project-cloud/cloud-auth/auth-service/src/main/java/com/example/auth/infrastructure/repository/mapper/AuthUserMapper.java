package com.example.auth.infrastructure.repository.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.auth.domain.entity.AuthUser;
import org.apache.ibatis.annotations.Mapper;

/**
 * 认证用户 Mapper
 */
@Mapper
public interface AuthUserMapper extends BaseMapper<AuthUser> {
}


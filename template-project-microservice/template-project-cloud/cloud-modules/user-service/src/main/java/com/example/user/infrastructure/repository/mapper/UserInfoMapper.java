package com.example.user.infrastructure.repository.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.user.domain.entity.UserInfo;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户信息 Mapper
 */
@Mapper
public interface UserInfoMapper extends BaseMapper<UserInfo> {
}




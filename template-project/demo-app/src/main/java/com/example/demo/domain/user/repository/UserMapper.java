package com.example.demo.domain.user.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.domain.user.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}


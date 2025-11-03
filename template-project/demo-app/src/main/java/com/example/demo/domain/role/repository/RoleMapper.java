package com.example.demo.domain.role.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.domain.role.entity.Role;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RoleMapper extends BaseMapper<Role> {

    @Select("SELECT r.* FROM \"role\" r " +
            "INNER JOIN \"user_role\" ur ON r.id = ur.role_id " +
            "WHERE ur.user_id = #{userId}")
    List<Role> findRolesByUserId(String userId);
}


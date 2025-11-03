package com.example.demo.domain.security.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.domain.security.entity.SecurityPermission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SecurityPermissionMapper extends BaseMapper<SecurityPermission> {

    /**
     * 查询所有启用的权限配置（按排序字段排序）
     */
    @Select("SELECT * FROM \"security_permission\" WHERE enabled = TRUE ORDER BY sort_order ASC, create_time ASC")
    List<SecurityPermission> findAllEnabled();
}


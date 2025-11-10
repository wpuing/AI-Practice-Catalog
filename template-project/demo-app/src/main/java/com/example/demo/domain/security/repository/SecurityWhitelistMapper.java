package com.example.demo.domain.security.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.domain.security.entity.SecurityWhitelist;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SecurityWhitelistMapper extends BaseMapper<SecurityWhitelist> {

    /**
     * 查询所有启用的白名单（按排序字段排序）
     */
    @Select("SELECT * FROM \"security_whitelist\" WHERE enabled = TRUE ORDER BY sort_order ASC, create_date ASC")
    List<SecurityWhitelist> findAllEnabled();
}


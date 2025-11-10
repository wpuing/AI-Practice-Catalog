package com.example.demo.domain.menu.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.domain.menu.entity.MenuPermission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 菜单功能权限Mapper
 */
@Mapper
public interface MenuPermissionMapper extends BaseMapper<MenuPermission> {

    /**
     * 根据菜单ID查询功能权限列表
     */
    List<MenuPermission> selectByMenuId(@Param("menuId") String menuId);

    /**
     * 根据菜单ID查询安全权限ID列表
     */
    List<String> selectSecurityPermissionIdsByMenuId(@Param("menuId") String menuId);

    /**
     * 根据菜单ID删除所有功能权限
     */
    int deleteByMenuId(@Param("menuId") String menuId);

    /**
     * 批量插入
     */
    int insertBatch(@Param("list") List<MenuPermission> list);
}


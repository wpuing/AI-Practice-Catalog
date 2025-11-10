package com.example.demo.domain.menu.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.domain.menu.entity.RoleMenu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 角色菜单关联Mapper
 */
@Mapper
public interface RoleMenuMapper extends BaseMapper<RoleMenu> {

    /**
     * 根据角色ID删除所有菜单关联
     */
    int deleteByRoleId(@Param("roleId") String roleId);

    /**
     * 批量插入角色菜单关联
     */
    int insertBatch(@Param("roleMenus") List<RoleMenu> roleMenus);

    /**
     * 根据角色ID查询菜单ID列表
     */
    List<String> selectMenuIdsByRoleId(@Param("roleId") String roleId);
}


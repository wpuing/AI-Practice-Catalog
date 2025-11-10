package com.example.demo.domain.menu.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.domain.menu.entity.Menu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 菜单Mapper
 */
@Mapper
public interface MenuMapper extends BaseMapper<Menu> {

    /**
     * 根据角色ID查询菜单列表
     */
    List<Menu> selectMenusByRoleId(@Param("roleId") String roleId);

    /**
     * 查询所有启用的菜单（按排序）
     */
    List<Menu> selectAllEnabledMenus();
}


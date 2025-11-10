package com.example.demo.domain.menu.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.demo.domain.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 角色菜单关联实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("\"role_menu\"")
public class RoleMenu extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableField("role_id")
    private String roleId;

    @TableField("menu_id")
    private String menuId;
}


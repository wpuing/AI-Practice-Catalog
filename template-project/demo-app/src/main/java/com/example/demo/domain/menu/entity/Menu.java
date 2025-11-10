package com.example.demo.domain.menu.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.demo.domain.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 菜单实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("\"menu\"")
public class Menu extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableField("menu_name")
    private String menuName;

    @TableField("menu_code")
    private String menuCode;

    @TableField("parent_id")
    private String parentId;

    @TableField("menu_type")
    private String menuType; // MENU: 菜单, BUTTON: 按钮

    @TableField("path")
    private String path;

    @TableField("icon")
    private String icon;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("enabled")
    private Boolean enabled;

    @TableField("description")
    private String description;
}


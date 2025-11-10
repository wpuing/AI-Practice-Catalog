package com.example.demo.domain.menu.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.demo.domain.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 菜单功能权限实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("\"menu_permission\"")
public class MenuPermission extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableField("menu_id")
    private String menuId;

    @TableField("security_permission_id")
    private String securityPermissionId; // 关联 security_permission 表的 ID

    @TableField("description")
    private String description;

    @TableField("enabled")
    private Boolean enabled;

    @TableField("sort_order")
    private Integer sortOrder;
}


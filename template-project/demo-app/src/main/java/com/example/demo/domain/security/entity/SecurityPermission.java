package com.example.demo.domain.security.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.demo.domain.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 安全权限实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("\"security_permission\"")
public class SecurityPermission extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableField("path_pattern")
    private String pathPattern;

    @TableField("http_method")
    private String httpMethod;

    @TableField("required_roles")
    private String requiredRoles;  // 多个角色用逗号分隔，如：ADMIN,USER

    @TableField("description")
    private String description;

    @TableField("enabled")
    private Boolean enabled;

    @TableField("sort_order")
    private Integer sortOrder;
}


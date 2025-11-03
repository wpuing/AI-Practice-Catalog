package com.example.demo.domain.security.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 安全权限实体
 */
@Data
@TableName("\"security_permission\"")
public class SecurityPermission implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    @TableField("id")
    private String id;

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

    @TableField("create_time")
    private LocalDateTime createTime;

    @TableField("update_time")
    private LocalDateTime updateTime;
}


package com.example.demo.domain.security.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.demo.domain.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 安全白名单实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("\"security_whitelist\"")
public class SecurityWhitelist extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableField("path_pattern")
    private String pathPattern;

    @TableField("http_method")
    private String httpMethod;

    @TableField("description")
    private String description;

    @TableField("enabled")
    private Boolean enabled;

    @TableField("sort_order")
    private Integer sortOrder;
}


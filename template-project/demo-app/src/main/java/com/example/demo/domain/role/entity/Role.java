package com.example.demo.domain.role.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.demo.domain.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("\"role\"")
public class Role extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableField("role_name")
    private String roleName;

    @TableField("role_code")
    private String roleCode;

    @TableField("description")
    private String description;
}


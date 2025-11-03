package com.example.demo.domain.role.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

@Data
@TableName("\"role\"")
public class Role implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    @TableField("id")
    private String id;

    @TableField("role_name")
    private String roleName;

    @TableField("role_code")
    private String roleCode;

    @TableField("description")
    private String description;
}


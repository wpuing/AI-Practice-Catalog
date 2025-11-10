package com.example.demo.domain.user.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.demo.domain.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("\"user\"")
public class User extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableField("username")
    private String username;

    @TableField("password")
    private String password;
}


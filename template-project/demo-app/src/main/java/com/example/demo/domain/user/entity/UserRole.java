package com.example.demo.domain.user.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.demo.domain.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("\"user_role\"")
public class UserRole extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableField("user_id")
    private String userId;

    @TableField("role_id")
    private String roleId;
}


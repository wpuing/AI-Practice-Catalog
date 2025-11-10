package com.example.demo.domain.common;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 基础实体类
 * 包含所有表的公共字段
 */
@Data
public abstract class BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID（32位随机字符）
     * 注意：使用IdType.INPUT，由BaseServiceImpl自动生成ID
     */
    @TableId(type = IdType.INPUT)
    @TableField("id")
    private String id;

    /**
     * 创建时间
     */
    @TableField(value = "create_date", fill = FieldFill.INSERT)
    private LocalDateTime createDate;

    /**
     * 创建用户ID
     */
    @TableField(value = "create_user", fill = FieldFill.INSERT)
    private String createUser;

    /**
     * 修改时间
     */
    @TableField(value = "update_date", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateDate;

    /**
     * 修改用户ID
     */
    @TableField(value = "update_user", fill = FieldFill.INSERT_UPDATE)
    private String updateUser;

    /**
     * 是否删除（0=未删除，1=已删除）
     */
    @TableField(value = "deleted", fill = FieldFill.INSERT)
    private Integer deleted;

    /**
     * 版本号（乐观锁）
     */
    @TableField(value = "db_version", fill = FieldFill.INSERT)
    private Integer dbVersion;

    /**
     * 租户ID
     */
    @TableField("tenant_id")
    private String tenantId;

    // 兼容旧字段名（用于查询时映射）
    @TableField(value = "create_time", exist = false)
    private LocalDateTime createTime;

    @TableField(value = "update_time", exist = false)
    private LocalDateTime updateTime;

    @TableField(value = "version", exist = false)
    private Integer version;
}


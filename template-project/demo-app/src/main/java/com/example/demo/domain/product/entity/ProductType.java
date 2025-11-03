package com.example.demo.domain.product.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 商品类型实体类
 */
@Data
@TableName("\"product_type\"")
public class ProductType implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    @TableField("id")
    private String id;

    @TableField("type_name")
    private String typeName;

    @TableField("type_code")
    private String typeCode;

    @TableField("description")
    private String description;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("enabled")
    private Boolean enabled;

    @TableField("create_time")
    private LocalDateTime createTime;

    @TableField("update_time")
    private LocalDateTime updateTime;
}


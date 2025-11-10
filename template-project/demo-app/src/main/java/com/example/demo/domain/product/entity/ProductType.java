package com.example.demo.domain.product.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.demo.domain.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 商品类型实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("\"product_type\"")
public class ProductType extends BaseEntity {

    private static final long serialVersionUID = 1L;

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
}


package com.example.demo.domain.product.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.demo.domain.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 商品实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("\"product\"")
public class Product extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableField("product_name")
    private String productName;

    @TableField("product_code")
    private String productCode;

    @TableField("type_id")
    private String typeId;

    @TableField("price")
    private BigDecimal price;

    @TableField("stock")
    private Integer stock;

    @TableField("description")
    private String description;

    @TableField("image_url")
    private String imageUrl;

    @TableField("enabled")
    private Boolean enabled;
}


package com.example.product.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品信息实体
 */
@Data
@TableName("product_info")
public class ProductInfo {
    @TableId(type = IdType.ASSIGN_ID)
    private String id;
    private String productName;
    private String productCode;
    private String typeId;
    private BigDecimal price;
    private Integer stock;
    private String description;
    private String imageUrl;
    private Boolean enabled;
    private LocalDateTime createDate;
    private String createUser;
    private LocalDateTime updateDate;
    private String updateUser;
    private Integer deleted;
    private Integer dbVersion;
}




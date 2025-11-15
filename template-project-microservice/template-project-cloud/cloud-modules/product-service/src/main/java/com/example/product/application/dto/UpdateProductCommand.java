package com.example.product.application.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 更新商品命令
 */
@Data
public class UpdateProductCommand {
    private String productName;
    private String productCode;
    private String category;
    private String typeId;
    private BigDecimal price;
    private Integer stock;
    private String description;
    private Integer status;
}




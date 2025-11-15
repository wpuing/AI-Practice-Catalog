package com.example.product.application.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品DTO
 */
@Data
public class ProductDTO {
    private String id;
    private String productName;
    private String productCode;
    private String typeId;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private String description;
    private String imageUrl;
    private Integer status;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
}




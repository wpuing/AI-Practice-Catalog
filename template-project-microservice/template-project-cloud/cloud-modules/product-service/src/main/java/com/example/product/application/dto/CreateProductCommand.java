package com.example.product.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 创建商品命令
 */
@Data
public class CreateProductCommand {
    @NotBlank(message = "商品名称不能为空")
    private String productName;

    @NotBlank(message = "商品编码不能为空")
    private String productCode;

    private String category;
    private String typeId;

    @NotNull(message = "价格不能为空")
    private BigDecimal price;

    @NotNull(message = "库存不能为空")
    private Integer stock;

    private String description;
    private Integer status = 1;
}




package com.example.product.interfaces.rest;

import com.example.core.common.result.Result;
import com.example.product.application.dto.CreateProductCommand;
import com.example.product.application.dto.PageResult;
import com.example.product.application.dto.ProductDTO;
import com.example.product.application.dto.UpdateProductCommand;
import com.example.product.application.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 商品控制器
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public Result<PageResult<ProductDTO>> getProductList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        PageResult<ProductDTO> result = productService.getProductList(pageNum, pageSize, keyword);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<ProductDTO> getProductById(@PathVariable String id) {
        ProductDTO product = productService.getProductById(id);
        return Result.success(product);
    }

    @PostMapping
    public Result<ProductDTO> createProduct(@RequestBody @Valid CreateProductCommand command) {
        ProductDTO product = productService.createProduct(command);
        return Result.success(product);
    }

    @PutMapping("/{id}")
    public Result<ProductDTO> updateProduct(@PathVariable String id, @RequestBody @Valid UpdateProductCommand command) {
        ProductDTO product = productService.updateProduct(id, command);
        return Result.success(product);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return Result.success();
    }

    @GetMapping("/types")
    public Result<java.util.List<String>> getProductTypes() {
        // 暂时返回空列表，后续可以查询product_type表
        return Result.success(java.util.Collections.emptyList());
    }
}




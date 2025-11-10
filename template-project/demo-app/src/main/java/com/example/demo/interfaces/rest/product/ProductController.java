package com.example.demo.interfaces.rest.product;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.common.result.Result;
import com.example.demo.domain.product.entity.Product;
import com.example.demo.domain.product.entity.ProductType;
import com.example.demo.common.enums.StatusCode;
import com.example.demo.application.product.ProductService;
import com.example.demo.application.product.ProductTypeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 商品控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductTypeService productTypeService;

    /**
     * 创建商品
     */
    @PostMapping
    public Result<Product> createProduct(@RequestBody Product product) {
        // 检查商品代码是否已存在
        Product existing = productService.getOne(
                new QueryWrapper<Product>()
                        .eq("product_code", product.getProductCode()));
        if (existing != null) {
            return Result.error(StatusCode.USERNAME_EXISTS.getCode(), "商品代码已存在");
        }

        // 检查商品类型是否存在
        if (product.getTypeId() != null) {
            ProductType productType = productTypeService.getById(product.getTypeId());
            if (productType == null) {
                return Result.error(StatusCode.NOT_FOUND.getCode(), "商品类型不存在");
            }
        }

        // createDate和updateDate由MetaObjectHandler自动填充
        if (product.getEnabled() == null) {
            product.setEnabled(true);
        }
        if (product.getPrice() == null) {
            product.setPrice(java.math.BigDecimal.ZERO);
        }
        if (product.getStock() == null) {
            product.setStock(0);
        }

        boolean saved = productService.save(product);
        if (saved) {
            return Result.success("商品创建成功", product);
        } else {
            return Result.error(StatusCode.CREATE_FAILED.getCode(), StatusCode.CREATE_FAILED.getMessage());
        }
    }

    /**
     * 根据ID查询商品
     */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> getProductById(@PathVariable String id) {
        Product product = productService.getById(id);
        if (product != null) {
            Map<String, Object> result = new HashMap<>();
            result.put("product", product);
            
            // 查询商品类型信息
            if (product.getTypeId() != null) {
                ProductType productType = productTypeService.getById(product.getTypeId());
                result.put("productType", productType);
            }
            
            return Result.success(result);
        } else {
            return Result.error(StatusCode.NOT_FOUND.getCode(), "商品不存在");
        }
    }

    /**
     * 查询所有商品（分页）
     */
    @GetMapping
    public Result<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String typeId,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String keyword) {
        Page<Product> page = new Page<>(current, size);
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        
        if (typeId != null && !typeId.trim().isEmpty()) {
            queryWrapper.eq("type_id", typeId);
        }
        if (enabled != null) {
            queryWrapper.eq("enabled", enabled);
        }
        // 如果有关键词，添加查询条件
        if (keyword != null && !keyword.trim().isEmpty()) {
            queryWrapper.and(wrapper -> wrapper
                .like("product_name", keyword.trim())
                .or()
                .like("product_code", keyword.trim())
                .or()
                .like("description", keyword.trim())
            );
        }
        
        queryWrapper.orderByDesc("create_date");
        Page<Product> productPage = productService.page(page, queryWrapper);
        return Result.success(productPage);
    }

    /**
     * 查询所有启用的商品（不分页）
     */
    @GetMapping("/enabled")
    public Result<List<Product>> getEnabledProducts(@RequestParam(required = false) String typeId) {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("enabled", true);
        
        if (typeId != null && !typeId.trim().isEmpty()) {
            queryWrapper.eq("type_id", typeId);
        }
        
        queryWrapper.orderByDesc("create_date");
        List<Product> list = productService.list(queryWrapper);
        return Result.success(list);
    }

    /**
     * 更新商品
     */
    @PutMapping("/{id}")
    public Result<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        Product existing = productService.getById(id);
        if (existing == null) {
            return Result.error(StatusCode.NOT_FOUND.getCode(), "商品不存在");
        }

        // 如果修改了商品代码，检查是否重复
        if (product.getProductCode() != null && !product.getProductCode().equals(existing.getProductCode())) {
            Product duplicate = productService.getOne(
                    new QueryWrapper<Product>()
                            .eq("product_code", product.getProductCode()));
            if (duplicate != null) {
                return Result.error(StatusCode.USERNAME_EXISTS.getCode(), "商品代码已存在");
            }
        }

        // 如果修改了商品类型，检查类型是否存在
        if (product.getTypeId() != null && !product.getTypeId().equals(existing.getTypeId())) {
            ProductType productType = productTypeService.getById(product.getTypeId());
            if (productType == null) {
                return Result.error(StatusCode.NOT_FOUND.getCode(), "商品类型不存在");
            }
        }

        product.setId(id);
        // updateDate由MetaObjectHandler自动填充

        boolean updated = productService.updateById(product);
        if (updated) {
            return Result.success("商品更新成功", productService.getById(id));
        } else {
            return Result.error(StatusCode.UPDATE_FAILED.getCode(), StatusCode.UPDATE_FAILED.getMessage());
        }
    }

    /**
     * 删除商品
     */
    @DeleteMapping("/{id}")
    public Result<String> deleteProduct(@PathVariable String id) {
        Product existing = productService.getById(id);
        if (existing == null) {
            return Result.error(StatusCode.NOT_FOUND.getCode(), "商品不存在");
        }

        boolean removed = productService.removeById(id);
        if (removed) {
            return Result.success("商品删除成功");
        } else {
            return Result.error(StatusCode.DELETE_FAILED.getCode(), StatusCode.DELETE_FAILED.getMessage());
        }
    }

    /**
     * 搜索商品
     */
    @GetMapping("/search")
    public Result<List<Product>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(required = false) String typeId) {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.and(wrapper -> wrapper
                .like("product_name", keyword)
                .or()
                .like("product_code", keyword)
                .or()
                .like("description", keyword));
        
        if (typeId != null && !typeId.trim().isEmpty()) {
            queryWrapper.eq("type_id", typeId);
        }
        
        queryWrapper.orderByDesc("create_date");
        List<Product> list = productService.list(queryWrapper);
        return Result.success(list);
    }

    /**
     * 更新库存
     */
    @PutMapping("/{id}/stock")
    public Result<Product> updateStock(@PathVariable String id, @RequestParam Integer stock) {
        Product product = productService.getById(id);
        if (product == null) {
            return Result.error(StatusCode.NOT_FOUND.getCode(), "商品不存在");
        }

        product.setStock(stock);
        // updateDate由MetaObjectHandler自动填充

        boolean updated = productService.updateById(product);
        if (updated) {
            return Result.success("库存更新成功", productService.getById(id));
        } else {
            return Result.error(StatusCode.UPDATE_FAILED.getCode(), StatusCode.UPDATE_FAILED.getMessage());
        }
    }
}


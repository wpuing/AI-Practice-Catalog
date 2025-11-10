package com.example.demo.interfaces.rest.product;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.common.result.Result;
import com.example.demo.domain.product.entity.ProductType;
import com.example.demo.common.enums.StatusCode;
import com.example.demo.application.product.ProductTypeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 商品类型控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/product-types")
public class ProductTypeController {

    @Autowired
    private ProductTypeService productTypeService;

    /**
     * 创建商品类型
     */
    @PostMapping
    public Result<ProductType> createProductType(@RequestBody ProductType productType) {
        // 检查类型代码是否已存在
        ProductType existing = productTypeService.getOne(
                new QueryWrapper<ProductType>()
                        .eq("type_code", productType.getTypeCode()));
        if (existing != null) {
            return Result.error(StatusCode.USERNAME_EXISTS.getCode(), "商品类型代码已存在");
        }

        // createDate和updateDate由MetaObjectHandler自动填充
        if (productType.getEnabled() == null) {
            productType.setEnabled(true);
        }
        if (productType.getSortOrder() == null) {
            productType.setSortOrder(0);
        }

        boolean saved = productTypeService.save(productType);
        if (saved) {
            return Result.success("商品类型创建成功", productType);
        } else {
            return Result.error(StatusCode.CREATE_FAILED.getCode(), StatusCode.CREATE_FAILED.getMessage());
        }
    }

    /**
     * 根据ID查询商品类型
     */
    @GetMapping("/{id}")
    public Result<ProductType> getProductTypeById(@PathVariable String id) {
        ProductType productType = productTypeService.getById(id);
        if (productType != null) {
            return Result.success(productType);
        } else {
            return Result.error(StatusCode.NOT_FOUND.getCode(), "商品类型不存在");
        }
    }

    /**
     * 查询所有商品类型（分页）
     */
    @GetMapping
    public Result<Page<ProductType>> getAllProductTypes(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String keyword) {
        Page<ProductType> page = new Page<>(current, size);
        QueryWrapper<ProductType> queryWrapper = new QueryWrapper<>();
        if (enabled != null) {
            queryWrapper.eq("enabled", enabled);
        }
        // 如果有关键词，添加查询条件
        if (keyword != null && !keyword.trim().isEmpty()) {
            queryWrapper.and(wrapper -> wrapper
                .like("type_name", keyword.trim())
                .or()
                .like("type_code", keyword.trim())
                .or()
                .like("description", keyword.trim())
            );
        }
        queryWrapper.orderByAsc("sort_order", "create_date");
        Page<ProductType> productTypePage = productTypeService.page(page, queryWrapper);
        return Result.success(productTypePage);
    }

    /**
     * 查询所有启用的商品类型（不分页）
     */
    @GetMapping("/enabled")
    public Result<List<ProductType>> getEnabledProductTypes() {
        QueryWrapper<ProductType> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("enabled", true);
        queryWrapper.orderByAsc("sort_order", "create_date");
        List<ProductType> list = productTypeService.list(queryWrapper);
        return Result.success(list);
    }

    /**
     * 更新商品类型
     */
    @PutMapping("/{id}")
    public Result<ProductType> updateProductType(@PathVariable String id, @RequestBody ProductType productType) {
        ProductType existing = productTypeService.getById(id);
        if (existing == null) {
            return Result.error(StatusCode.NOT_FOUND.getCode(), "商品类型不存在");
        }

        // 如果修改了类型代码，检查是否重复
        if (productType.getTypeCode() != null && !productType.getTypeCode().equals(existing.getTypeCode())) {
            ProductType duplicate = productTypeService.getOne(
                    new QueryWrapper<ProductType>()
                            .eq("type_code", productType.getTypeCode()));
            if (duplicate != null) {
                return Result.error(StatusCode.USERNAME_EXISTS.getCode(), "商品类型代码已存在");
            }
        }

        productType.setId(id);
        // updateDate由MetaObjectHandler自动填充

        boolean updated = productTypeService.updateById(productType);
        if (updated) {
            return Result.success("商品类型更新成功", productTypeService.getById(id));
        } else {
            return Result.error(StatusCode.UPDATE_FAILED.getCode(), StatusCode.UPDATE_FAILED.getMessage());
        }
    }

    /**
     * 删除商品类型
     */
    @DeleteMapping("/{id}")
    public Result<String> deleteProductType(@PathVariable String id) {
        ProductType existing = productTypeService.getById(id);
        if (existing == null) {
            return Result.error(StatusCode.NOT_FOUND.getCode(), "商品类型不存在");
        }

        boolean removed = productTypeService.removeById(id);
        if (removed) {
            return Result.success("商品类型删除成功");
        } else {
            return Result.error(StatusCode.DELETE_FAILED.getCode(), StatusCode.DELETE_FAILED.getMessage());
        }
    }

    /**
     * 根据类型代码查询
     */
    @GetMapping("/search")
    public Result<List<ProductType>> searchProductTypes(@RequestParam String keyword) {
        QueryWrapper<ProductType> queryWrapper = new QueryWrapper<>();
        queryWrapper.and(wrapper -> wrapper
                .like("type_name", keyword)
                .or()
                .like("type_code", keyword)
                .or()
                .like("description", keyword));
        queryWrapper.orderByAsc("sort_order", "create_date");
        List<ProductType> list = productTypeService.list(queryWrapper);
        return Result.success(list);
    }
}


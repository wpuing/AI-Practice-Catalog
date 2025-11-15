package com.example.product.domain.repository;

import com.example.product.domain.entity.ProductInfo;

import java.util.List;

/**
 * 商品信息仓储接口
 */
public interface ProductInfoRepository {
    ProductInfo findById(String id);
    List<ProductInfo> findList(int pageNum, int pageSize, String keyword);
    long count(String keyword);
    void save(ProductInfo product);
    void update(ProductInfo product);
    void delete(String id);
}




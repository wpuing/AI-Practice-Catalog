package com.example.demo.domain.product.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.domain.product.entity.Product;
import org.apache.ibatis.annotations.Mapper;

/**
 * 商品Mapper接口
 */
@Mapper
public interface ProductMapper extends BaseMapper<Product> {
}


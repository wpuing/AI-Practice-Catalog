package com.example.demo.domain.product.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.domain.product.entity.ProductType;
import org.apache.ibatis.annotations.Mapper;

/**
 * 商品类型Mapper接口
 */
@Mapper
public interface ProductTypeMapper extends BaseMapper<ProductType> {
}


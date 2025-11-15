package com.example.product.infrastructure.repository.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.product.domain.entity.ProductInfo;
import org.apache.ibatis.annotations.Mapper;

/**
 * 商品信息 Mapper
 */
@Mapper
public interface ProductInfoMapper extends BaseMapper<ProductInfo> {
}




package com.example.demo.application.product.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.domain.product.entity.ProductType;
import com.example.demo.domain.product.repository.ProductTypeMapper;
import com.example.demo.application.product.ProductTypeService;
import org.springframework.stereotype.Service;

/**
 * 商品类型服务实现类
 */
@Service
public class ProductTypeServiceImpl extends ServiceImpl<ProductTypeMapper, ProductType> implements ProductTypeService {
}


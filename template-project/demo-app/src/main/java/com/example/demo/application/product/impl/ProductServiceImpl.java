package com.example.demo.application.product.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.domain.product.entity.Product;
import com.example.demo.domain.product.repository.ProductMapper;
import com.example.demo.application.product.ProductService;
import org.springframework.stereotype.Service;

/**
 * 商品服务实现类
 */
@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {
}


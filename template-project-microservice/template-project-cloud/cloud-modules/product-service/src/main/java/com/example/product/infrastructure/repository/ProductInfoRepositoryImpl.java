package com.example.product.infrastructure.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.product.domain.entity.ProductInfo;
import com.example.product.domain.repository.ProductInfoRepository;
import com.example.product.infrastructure.repository.mapper.ProductInfoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 商品信息仓储实现
 */
@Repository
@RequiredArgsConstructor
public class ProductInfoRepositoryImpl implements ProductInfoRepository {
    private final ProductInfoMapper productInfoMapper;

    @Override
    public ProductInfo findById(String id) {
        return productInfoMapper.selectOne(
                new LambdaQueryWrapper<ProductInfo>()
                        .eq(ProductInfo::getId, id)
                        .eq(ProductInfo::getDeleted, 0)
        );
    }

    @Override
    public List<ProductInfo> findList(int pageNum, int pageSize, String keyword) {
        LambdaQueryWrapper<ProductInfo> wrapper = new LambdaQueryWrapper<ProductInfo>()
                .eq(ProductInfo::getDeleted, 0)
                .orderByDesc(ProductInfo::getCreateDate);

        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w
                    .like(ProductInfo::getProductName, keyword)
                    .or()
                    .like(ProductInfo::getProductCode, keyword)
                    .or()
                    .like(ProductInfo::getDescription, keyword)
            );
        }

        Page<ProductInfo> page = new Page<>(pageNum, pageSize);
        Page<ProductInfo> result = productInfoMapper.selectPage(page, wrapper);
        return result.getRecords();
    }

    @Override
    public long count(String keyword) {
        LambdaQueryWrapper<ProductInfo> wrapper = new LambdaQueryWrapper<ProductInfo>()
                .eq(ProductInfo::getDeleted, 0);

        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w
                    .like(ProductInfo::getProductName, keyword)
                    .or()
                    .like(ProductInfo::getProductCode, keyword)
                    .or()
                    .like(ProductInfo::getDescription, keyword)
            );
        }

        return productInfoMapper.selectCount(wrapper);
    }

    @Override
    public void save(ProductInfo product) {
        productInfoMapper.insert(product);
    }

    @Override
    public void update(ProductInfo product) {
        productInfoMapper.updateById(product);
    }

    @Override
    public void delete(String id) {
        productInfoMapper.update(null,
                new LambdaUpdateWrapper<ProductInfo>()
                        .eq(ProductInfo::getId, id)
                        .set(ProductInfo::getDeleted, 1)
        );
    }
}




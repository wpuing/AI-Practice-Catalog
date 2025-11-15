package com.example.product.application.service;

import com.example.core.common.exception.BusinessException;
import com.example.core.common.result.ResultCode;
import com.example.product.application.dto.CreateProductCommand;
import com.example.product.application.dto.PageResult;
import com.example.product.application.dto.ProductDTO;
import com.example.product.application.dto.UpdateProductCommand;
import com.example.product.domain.entity.ProductInfo;
import com.example.product.domain.repository.ProductInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 商品服务
 */
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductInfoRepository productInfoRepository;

    public PageResult<ProductDTO> getProductList(int pageNum, int pageSize, String keyword) {
        List<ProductInfo> products = productInfoRepository.findList(pageNum, pageSize, keyword);
        long total = productInfoRepository.count(keyword);

        List<ProductDTO> productDTOs = products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new PageResult<>(productDTOs, total, pageNum, pageSize);
    }

    public ProductDTO getProductById(String id) {
        ProductInfo product = productInfoRepository.findById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "商品不存在");
        }
        return convertToDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(CreateProductCommand command) {
        ProductInfo product = new ProductInfo();
        product.setProductName(command.getProductName());
        product.setProductCode(command.getProductCode());
        product.setTypeId(command.getTypeId());
        product.setPrice(command.getPrice());
        product.setStock(command.getStock());
        product.setDescription(command.getDescription());
        product.setEnabled(command.getStatus() == 1);
        product.setCreateDate(LocalDateTime.now());
        product.setCreateUser("system");
        product.setDeleted(0);
        product.setDbVersion(1);

        productInfoRepository.save(product);
        return convertToDTO(product);
    }

    @Transactional
    public ProductDTO updateProduct(String id, UpdateProductCommand command) {
        ProductInfo product = productInfoRepository.findById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "商品不存在");
        }

        if (StringUtils.hasText(command.getProductName())) {
            product.setProductName(command.getProductName());
        }
        if (StringUtils.hasText(command.getProductCode())) {
            product.setProductCode(command.getProductCode());
        }
        if (StringUtils.hasText(command.getTypeId())) {
            product.setTypeId(command.getTypeId());
        }
        if (command.getPrice() != null) {
            product.setPrice(command.getPrice());
        }
        if (command.getStock() != null) {
            product.setStock(command.getStock());
        }
        if (command.getDescription() != null) {
            product.setDescription(command.getDescription());
        }
        if (command.getStatus() != null) {
            product.setEnabled(command.getStatus() == 1);
        }

        product.setUpdateDate(LocalDateTime.now());
        product.setUpdateUser("system");
        product.setDbVersion(product.getDbVersion() + 1);

        productInfoRepository.update(product);
        return convertToDTO(product);
    }

    @Transactional
    public void deleteProduct(String id) {
        ProductInfo product = productInfoRepository.findById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "商品不存在");
        }
        productInfoRepository.delete(id);
    }

    private ProductDTO convertToDTO(ProductInfo product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setProductName(product.getProductName());
        dto.setProductCode(product.getProductCode());
        dto.setTypeId(product.getTypeId());
        dto.setCategory(product.getTypeId()); // 暂时用typeId作为category
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setDescription(product.getDescription());
        dto.setImageUrl(product.getImageUrl());
        dto.setStatus(product.getEnabled() ? 1 : 0);
        dto.setCreateDate(product.getCreateDate());
        dto.setUpdateDate(product.getUpdateDate());
        return dto;
    }
}




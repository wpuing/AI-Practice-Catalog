package com.example.demo.controller;

import com.example.demo.domain.product.entity.Product;
import com.example.demo.domain.product.entity.ProductType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 商品控制器测试
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Product testProduct;
    private String typeId;

    @BeforeEach
    void setUp() throws Exception {
        // 先创建一个商品类型
        ProductType productType = new ProductType();
        productType.setTypeName("测试类型");
        productType.setTypeCode("TEST_TYPE_" + System.currentTimeMillis());
        productType.setDescription("测试类型描述");
        productType.setEnabled(true);

        String typeJson = objectMapper.writeValueAsString(productType);
        String typeResponse = mockMvc.perform(post("/api/product-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(typeJson))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var typeJsonNode = objectMapper.readTree(typeResponse);
        var typeDataNode = typeJsonNode.get("data");
        if (typeDataNode != null && typeDataNode.has("id")) {
            typeId = typeDataNode.get("id").asText();
        }

        // 创建测试商品
        testProduct = new Product();
        testProduct.setProductName("测试商品");
        testProduct.setProductCode("TEST_PRODUCT_" + System.currentTimeMillis());
        testProduct.setTypeId(typeId);
        testProduct.setPrice(new BigDecimal("99.99"));
        testProduct.setStock(100);
        testProduct.setDescription("这是一个测试商品");
        testProduct.setEnabled(true);
    }

    @Test
    @WithMockUser(roles = "USER")
    void testCreateProduct() throws Exception {
        String json = objectMapper.writeValueAsString(testProduct);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.productName").value("测试商品"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testGetProductById() throws Exception {
        // 先创建商品
        String json = objectMapper.writeValueAsString(testProduct);
        String response = mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var jsonNode = objectMapper.readTree(response);
        var dataNode = jsonNode.get("data");
        if (dataNode == null || !dataNode.has("id")) {
            throw new RuntimeException("创建商品失败，无法获取ID");
        }
        String productId = dataNode.get("id").asText();

        // 查询商品
        mockMvc.perform(get("/api/products/{id}", productId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.product.id").value(productId))
                .andExpect(jsonPath("$.data.product.productName").value("测试商品"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testGetAllProducts() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("current", "1")
                        .param("size", "10"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testUpdateProduct() throws Exception {
        // 先创建商品
        String json = objectMapper.writeValueAsString(testProduct);
        String response = mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var jsonNode = objectMapper.readTree(response);
        var dataNode = jsonNode.get("data");
        if (dataNode == null || !dataNode.has("id")) {
            throw new RuntimeException("创建商品失败，无法获取ID");
        }
        String productId = dataNode.get("id").asText();

        // 更新商品
        Product updateProduct = new Product();
        updateProduct.setProductName("更新后的商品名称");
        updateProduct.setPrice(new BigDecimal("199.99"));
        updateProduct.setStock(200);

        String updateJson = objectMapper.writeValueAsString(updateProduct);

        mockMvc.perform(put("/api/products/{id}", productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.productName").value("更新后的商品名称"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testDeleteProduct() throws Exception {
        // 先创建商品
        String json = objectMapper.writeValueAsString(testProduct);
        String response = mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var jsonNode = objectMapper.readTree(response);
        var dataNode = jsonNode.get("data");
        if (dataNode == null || !dataNode.has("id")) {
            throw new RuntimeException("创建商品失败，无法获取ID");
        }
        String productId = dataNode.get("id").asText();

        // 删除商品
        mockMvc.perform(delete("/api/products/{id}", productId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 验证商品已被删除
        mockMvc.perform(get("/api/products/{id}", productId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testSearchProducts() throws Exception {
        // 先创建商品
        String json = objectMapper.writeValueAsString(testProduct);
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());

        // 搜索商品
        mockMvc.perform(get("/api/products/search")
                        .param("keyword", "测试"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testUpdateStock() throws Exception {
        // 先创建商品
        String json = objectMapper.writeValueAsString(testProduct);
        String response = mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var jsonNode = objectMapper.readTree(response);
        var dataNode = jsonNode.get("data");
        if (dataNode == null || !dataNode.has("id")) {
            throw new RuntimeException("创建商品失败，无法获取ID");
        }
        String productId = dataNode.get("id").asText();

        // 更新库存
        mockMvc.perform(put("/api/products/{id}/stock", productId)
                        .param("stock", "500"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.stock").value(500));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testGetEnabledProducts() throws Exception {
        mockMvc.perform(get("/api/products/enabled"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }
}


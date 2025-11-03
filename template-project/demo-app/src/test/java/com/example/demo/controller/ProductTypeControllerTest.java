package com.example.demo.controller;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 商品类型控制器测试
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProductTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private ProductType testProductType;

    @BeforeEach
    void setUp() {
        testProductType = new ProductType();
        testProductType.setTypeName("测试类型");
        testProductType.setTypeCode("TEST_TYPE");
        testProductType.setDescription("这是一个测试类型");
        testProductType.setSortOrder(1);
        testProductType.setEnabled(true);
    }

    @Test
    @WithMockUser(roles = "USER")
    void testCreateProductType() throws Exception {
        String json = objectMapper.writeValueAsString(testProductType);

        mockMvc.perform(post("/api/product-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.typeName").value("测试类型"))
                .andExpect(jsonPath("$.data.typeCode").value("TEST_TYPE"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testGetProductTypeById() throws Exception {
        // 先创建商品类型
        String json = objectMapper.writeValueAsString(testProductType);
        String response = mockMvc.perform(post("/api/product-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var jsonNode = objectMapper.readTree(response);
        var dataNode = jsonNode.get("data");
        if (dataNode == null || !dataNode.has("id")) {
            throw new RuntimeException("创建商品类型失败，无法获取ID");
        }
        String typeId = dataNode.get("id").asText();

        // 查询商品类型
        mockMvc.perform(get("/api/product-types/{id}", typeId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(typeId))
                .andExpect(jsonPath("$.data.typeName").value("测试类型"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testGetAllProductTypes() throws Exception {
        mockMvc.perform(get("/api/product-types")
                        .param("current", "1")
                        .param("size", "10"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testUpdateProductType() throws Exception {
        // 先创建商品类型
        String json = objectMapper.writeValueAsString(testProductType);
        String response = mockMvc.perform(post("/api/product-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var jsonNode = objectMapper.readTree(response);
        var dataNode = jsonNode.get("data");
        if (dataNode == null || !dataNode.has("id")) {
            throw new RuntimeException("创建商品类型失败，无法获取ID");
        }
        String typeId = dataNode.get("id").asText();

        // 更新商品类型
        ProductType updateProductType = new ProductType();
        updateProductType.setTypeName("更新后的类型名称");
        updateProductType.setDescription("更新后的描述");

        String updateJson = objectMapper.writeValueAsString(updateProductType);

        mockMvc.perform(put("/api/product-types/{id}", typeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.typeName").value("更新后的类型名称"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testDeleteProductType() throws Exception {
        // 先创建商品类型
        String json = objectMapper.writeValueAsString(testProductType);
        String response = mockMvc.perform(post("/api/product-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var jsonNode = objectMapper.readTree(response);
        var dataNode = jsonNode.get("data");
        if (dataNode == null || !dataNode.has("id")) {
            throw new RuntimeException("创建商品类型失败，无法获取ID");
        }
        String typeId = dataNode.get("id").asText();

        // 删除商品类型
        mockMvc.perform(delete("/api/product-types/{id}", typeId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 验证商品类型已被删除
        mockMvc.perform(get("/api/product-types/{id}", typeId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testSearchProductTypes() throws Exception {
        // 先创建商品类型
        String json = objectMapper.writeValueAsString(testProductType);
        mockMvc.perform(post("/api/product-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());

        // 搜索商品类型
        mockMvc.perform(get("/api/product-types/search")
                        .param("keyword", "测试"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testGetEnabledProductTypes() throws Exception {
        mockMvc.perform(get("/api/product-types/enabled"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }
}


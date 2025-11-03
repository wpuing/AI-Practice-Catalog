package com.example.demo.controller;

import com.example.demo.domain.user.entity.User;
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

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPassword("testpass");
    }

    @Test
    @WithMockUser(roles = "USER")
    void testCreateUser() throws Exception {
        String userJson = objectMapper.writeValueAsString(testUser);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testGetUserById() throws Exception {
        // 先创建用户
        String userJson = objectMapper.writeValueAsString(testUser);
        String response = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 从响应中提取ID（更安全的解析方式）
        var jsonNode = objectMapper.readTree(response);
        var dataNode = jsonNode.get("data");
        if (dataNode == null || !dataNode.has("id")) {
            throw new RuntimeException("创建用户失败，无法获取用户ID");
        }
        String userId = dataNode.get("id").asText();

        // 查询用户
        mockMvc.perform(get("/api/users/{id}", userId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(userId))
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testGetAllUsers() throws Exception {
        mockMvc.perform(get("/api/users")
                        .param("current", "1")
                        .param("size", "10"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testUpdateUser() throws Exception {
        // 先创建用户
        String userJson = objectMapper.writeValueAsString(testUser);
        String response = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 从响应中提取ID（更安全的解析方式）
        var jsonNode = objectMapper.readTree(response);
        var dataNode = jsonNode.get("data");
        if (dataNode == null || !dataNode.has("id")) {
            throw new RuntimeException("创建用户失败，无法获取用户ID");
        }
        String userId = dataNode.get("id").asText();

        // 更新用户
        User updateUser = new User();
        updateUser.setUsername("updateduser");
        updateUser.setPassword("updatedpass");

        String updateJson = objectMapper.writeValueAsString(updateUser);

        mockMvc.perform(put("/api/users/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("updateduser"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testDeleteUser() throws Exception {
        // 先创建用户
        String userJson = objectMapper.writeValueAsString(testUser);
        String response = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 从响应中提取ID（更安全的解析方式）
        var jsonNode = objectMapper.readTree(response);
        var dataNode = jsonNode.get("data");
        if (dataNode == null || !dataNode.has("id")) {
            throw new RuntimeException("创建用户失败，无法获取用户ID");
        }
        String userId = dataNode.get("id").asText();

        // 删除用户
        mockMvc.perform(delete("/api/users/{id}", userId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 验证用户已被删除
        mockMvc.perform(get("/api/users/{id}", userId))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testSearchUsers() throws Exception {
        // 先创建用户
        String userJson = objectMapper.writeValueAsString(testUser);
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isOk());

        // 搜索用户
        mockMvc.perform(get("/api/users/search")
                        .param("username", "test"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }
}


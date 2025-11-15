package com.example.core.feign;

import com.example.core.common.result.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

/**
 * 用户服务 Feign 客户端
 */
@FeignClient(name = "user-service", path = "/api/users")
public interface UserFeignClient {

    /**
     * 根据ID获取用户信息
     * 使用Map接收，避免依赖user-service的DTO类
     */
    @GetMapping("/{id}")
    Result<Map<String, Object>> getUserById(@PathVariable("id") String id);
}


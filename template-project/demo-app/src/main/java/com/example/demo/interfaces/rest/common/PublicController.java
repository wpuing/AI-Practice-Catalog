package com.example.demo.interfaces.rest.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 公共控制器
 * 白名单接口，无需认证即可访问
 */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    /**
     * 获取公共信息
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getPublicInfo() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "这是公开接口，无需认证");
        result.put("data", "任何人都可以访问此接口");
        return ResponseEntity.ok(result);
    }

    /**
     * 健康检查
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "UP");
        result.put("message", "服务运行正常");
        return ResponseEntity.ok(result);
    }
}


package com.example.demo.interfaces.rest.admin;

import com.example.demo.application.user.UserService;
import com.example.demo.application.product.ProductService;
import com.example.demo.application.product.ProductTypeService;
import com.example.demo.common.result.Result;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 管理员控制器
 * 需要 ADMIN 角色才能访问
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductTypeService productTypeService;

    /**
     * 管理员可以强制删除用户
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> forceDeleteUser(@PathVariable String id) {
        boolean removed = userService.removeById(id);
        Map<String, Object> result = new HashMap<>();
        if (removed) {
            result.put("success", true);
            result.put("message", "用户已被管理员强制删除");
        } else {
            result.put("success", false);
            result.put("message", "删除失败");
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 管理员可以查看所有用户（包括敏感信息）
     */
    @GetMapping("/users/all")
    public ResponseEntity<Map<String, Object>> getAllUsersAsAdmin() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", userService.list());
        result.put("message", "管理员查看所有用户");
        return ResponseEntity.ok(result);
    }

    /**
     * 管理员信息
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getAdminInfo() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "这是管理员专属接口");
        result.put("data", "管理员可以执行所有操作");
        return ResponseEntity.ok(result);
    }

    /**
     * 获取控制台统计数据（真实数据库统计，不受权限过滤影响）
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        try {
            // 获取用户总数（直接从数据库统计，不受角色过滤影响）
            long userCount = userService.count();
            
            // 获取商品类型总数
            long productTypeCount = productTypeService.count();
            
            // 获取商品总数
            long productCount = productService.count();
            
            // 获取启用商品数量
            QueryWrapper<com.example.demo.domain.product.entity.Product> enabledWrapper = 
                new QueryWrapper<>();
            enabledWrapper.eq("enabled", true);
            long activeProductCount = productService.count(enabledWrapper);
            
            // 获取禁用商品数量
            QueryWrapper<com.example.demo.domain.product.entity.Product> disabledWrapper = 
                new QueryWrapper<>();
            disabledWrapper.eq("enabled", false);
            long disabledProductCount = productService.count(disabledWrapper);
            
            Map<String, Object> data = new HashMap<>();
            data.put("userCount", userCount);
            data.put("productTypeCount", productTypeCount);
            data.put("productCount", productCount);
            data.put("activeProductCount", activeProductCount);
            data.put("disabledProductCount", disabledProductCount);
            
            return Result.success(data);
        } catch (Exception e) {
            return Result.error(500, "获取统计数据失败: " + e.getMessage());
        }
    }
}


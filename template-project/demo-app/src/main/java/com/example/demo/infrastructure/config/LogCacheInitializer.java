package com.example.demo.infrastructure.config;

import com.example.demo.application.log.OperationLogService;
import com.example.demo.common.constants.RedisKeyConstants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * 日志缓存初始化器
 * 系统启动时自动清除Redis中的日志列表缓存，确保数据一致性
 */
@Slf4j
@Component
@Order(2)  // 设置执行顺序，在角色缓存初始化之后执行
public class LogCacheInitializer implements CommandLineRunner {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("========================================");
        log.info("开始清除日志列表缓存...");
        try {
            // 清除所有日志列表缓存
            Set<String> keys = redisTemplate.keys(RedisKeyConstants.Log.LOG_LIST + "*");
            if (keys != null && !keys.isEmpty()) {
                long deletedCount = redisTemplate.delete(keys);
                log.info("已清除 {} 个日志列表缓存key", deletedCount);
            } else {
                log.info("没有找到需要清除的日志列表缓存");
            }
            
            // 可选：清除日志详情缓存（如果需要）
            // Set<String> detailKeys = redisTemplate.keys(RedisKeyConstants.Log.LOG_DETAIL + "*");
            // if (detailKeys != null && !detailKeys.isEmpty()) {
            //     long deletedDetailCount = redisTemplate.delete(detailKeys);
            //     log.info("已清除 {} 个日志详情缓存key", deletedDetailCount);
            // }
            
            log.info("日志列表缓存清除完成");
        } catch (Exception e) {
            log.error("清除日志列表缓存失败: " + e.getMessage(), e);
            // 不抛出异常，避免影响系统启动
        }
        log.info("========================================");
    }
}


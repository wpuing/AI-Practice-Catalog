package com.example.demo.application.log;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.common.constants.RedisKeyConstants;
import com.example.demo.domain.log.entity.OperationLog;
import com.example.demo.domain.log.repository.OperationLogMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * 操作日志服务
 */
@Slf4j
@Service
public class OperationLogService {

    @Autowired
    private OperationLogMapper operationLogMapper;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Value("${operation-log.retention-days:30}")
    private int retentionDays;

    @Value("${operation-log.save-directory:}")
    private String saveDirectory;

    @Value("${operation-log.cache.expire-time:3600}")
    private long cacheExpireTime;

    private final ObjectMapper objectMapper;

    public OperationLogService() {
        this.objectMapper = new ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /**
     * 保存操作日志
     */
    @Transactional
    public boolean saveLog(OperationLog operationLog) {
        try {
            // 设置操作时间和创建时间
            if (operationLog.getOperationTime() == null) {
                operationLog.setOperationTime(LocalDateTime.now());
            }
            if (operationLog.getCreateTime() == null) {
                operationLog.setCreateTime(LocalDateTime.now());
            }

            // 保存到数据库
            boolean saved = operationLogMapper.insert(operationLog) > 0;

            if (saved) {
                // 同步到Redis（缓存日志详情）
                cacheLogDetail(operationLog);
                // 清除列表缓存（因为新增了日志）
                clearListCache();
                log.debug("保存操作日志成功: logId={}, module={}, operationType={}", 
                    operationLog.getId(), operationLog.getModule(), operationLog.getOperationType());
            }

            return saved;
        } catch (Exception e) {
            log.error("保存操作日志失败: " + e.getMessage(), e);
            return false;
        }
    }

    /**
     * 分页查询日志（优先从Redis获取）
     */
    public IPage<OperationLog> getLogs(int page, int size, String module, String operationType, String username) {
        try {
            // 构建缓存key时包含筛选条件，确保不同筛选条件的缓存不冲突
            String cacheKey = RedisKeyConstants.getLogListKey(page, size) + 
                ":" + (module != null ? module : "") + 
                ":" + (operationType != null ? operationType : "") + 
                ":" + (username != null ? username : "");
            String cachedJson = redisTemplate.opsForValue().get(cacheKey);

            if (cachedJson != null && !cachedJson.isEmpty()) {
                try {
                    IPage<OperationLog> cachedPage = objectMapper.readValue(cachedJson, 
                        new TypeReference<Page<OperationLog>>() {});
                    log.debug("从Redis缓存获取日志列表: page={}, size={}", page, size);
                    return cachedPage;
                } catch (Exception e) {
                    log.warn("解析Redis缓存失败: " + e.getMessage());
                }
            }

            // 从数据库查询
            // 注意：Page构造函数的参数是(current, size)，不是(page, size)
            Page<OperationLog> pageParam = new Page<>(page, size);
            // 确保执行COUNT查询
            pageParam.setSearchCount(true);
            
            LambdaQueryWrapper<OperationLog> queryWrapper = new LambdaQueryWrapper<>();
            
            if (module != null && !module.isEmpty()) {
                queryWrapper.eq(OperationLog::getModule, module);
            }
            if (operationType != null && !operationType.isEmpty()) {
                queryWrapper.eq(OperationLog::getOperationType, operationType);
            }
            if (username != null && !username.isEmpty()) {
                queryWrapper.like(OperationLog::getUsername, username);
            }
            
            queryWrapper.orderByDesc(OperationLog::getOperationTime);
            
            IPage<OperationLog> result = operationLogMapper.selectPage(pageParam, queryWrapper);
            
            // 调试日志：打印分页结果
            log.debug("分页查询结果 - total: {}, current: {}, size: {}, pages: {}, records: {}", 
                result.getTotal(), result.getCurrent(), result.getSize(), result.getPages(), result.getRecords().size());

            // 缓存到Redis（使用包含筛选条件的key）
            try {
                String resultJson = objectMapper.writeValueAsString(result);
                redisTemplate.opsForValue().set(cacheKey, resultJson, cacheExpireTime, TimeUnit.SECONDS);
                log.debug("缓存日志列表到Redis: page={}, size={}, key={}", page, size, cacheKey);
            } catch (Exception e) {
                log.warn("缓存日志列表失败: " + e.getMessage());
            }

            return result;
        } catch (Exception e) {
            log.error("查询日志列表失败: " + e.getMessage(), e);
            return new Page<>(page, size);
        }
    }

    /**
     * 根据ID查询日志详情（优先从Redis获取）
     */
    public OperationLog getLogById(String logId) {
        try {
            // 尝试从Redis获取
            String cacheKey = RedisKeyConstants.getLogDetailKey(logId);
            String cachedJson = redisTemplate.opsForValue().get(cacheKey);

            if (cachedJson != null && !cachedJson.isEmpty()) {
                try {
                    OperationLog cachedLog = objectMapper.readValue(cachedJson, OperationLog.class);
                    log.debug("从Redis缓存获取日志详情: logId={}", logId);
                    return cachedLog;
                } catch (Exception e) {
                    log.warn("解析Redis缓存失败: " + e.getMessage());
                }
            }

            // 从数据库查询
            OperationLog log = operationLogMapper.selectById(logId);

            if (log != null) {
                // 缓存到Redis
                cacheLogDetail(log);
            }

            return log;
        } catch (Exception e) {
            log.error("查询日志详情失败: logId=" + logId + ", " + e.getMessage(), e);
            return null;
        }
    }

    /**
     * 缓存日志详情到Redis
     */
    private void cacheLogDetail(OperationLog operationLog) {
        try {
            String cacheKey = RedisKeyConstants.getLogDetailKey(operationLog.getId());
            String logJson = objectMapper.writeValueAsString(operationLog);
            redisTemplate.opsForValue().set(cacheKey, logJson, cacheExpireTime, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("缓存日志详情失败: " + e.getMessage());
        }
    }

    /**
     * 清除列表缓存
     */
    private void clearListCache() {
        try {
            // 清除所有列表缓存（包括所有筛选条件的缓存）
            Set<String> keys = redisTemplate.keys(RedisKeyConstants.Log.LOG_LIST + "*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.debug("清除日志列表缓存，共清除 {} 个key", keys.size());
            }
        } catch (Exception e) {
            log.warn("清除列表缓存失败: " + e.getMessage());
        }
    }

    /**
     * 定时任务：删除过期日志并持久化到文件
     * 每天凌晨2点执行
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanExpiredLogs() {
        try {
            LocalDateTime expireTime = LocalDateTime.now().minusDays(retentionDays);
            log.info("开始清理过期日志，过期时间: {}", expireTime);

            // 查询过期日志
            List<OperationLog> expiredLogs = operationLogMapper.selectByCreateTimeBefore(expireTime);

            if (expiredLogs != null && !expiredLogs.isEmpty()) {
                log.info("找到 {} 条过期日志", expiredLogs.size());

                // 如果配置了保存目录，则持久化到文件
                if (saveDirectory != null && !saveDirectory.isEmpty()) {
                    saveLogsToFile(expiredLogs, expireTime);
                }

                // 删除过期日志
                int deletedCount = operationLogMapper.deleteByCreateTimeBefore(expireTime);
                log.info("删除过期日志完成，删除数量: {}", deletedCount);

                // 清除相关缓存
                clearListCache();
            } else {
                log.info("没有找到过期日志");
            }
        } catch (Exception e) {
            log.error("清理过期日志失败: " + e.getMessage(), e);
        }
    }

    /**
     * 将日志保存到文件
     */
    private void saveLogsToFile(List<OperationLog> logs, LocalDateTime expireTime) {
        if (saveDirectory == null || saveDirectory.isEmpty()) {
            return;
        }

        try {
            File directory = new File(saveDirectory);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 文件名格式：operation_log_2024-11-08.txt
            String fileName = "operation_log_" + expireTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".txt";
            File file = new File(directory, fileName);

            try (FileWriter writer = new FileWriter(file, StandardCharsets.UTF_8, true)) {
                writer.write("========== 操作日志备份 ==========\n");
                writer.write("备份时间: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n");
                writer.write("日志数量: " + logs.size() + "\n");
                writer.write("过期时间: " + expireTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n");
                writer.write("=====================================\n\n");

                for (OperationLog log : logs) {
                    writer.write("日志ID: " + log.getId() + "\n");
                    writer.write("用户ID: " + log.getUserId() + "\n");
                    writer.write("用户名: " + log.getUsername() + "\n");
                    writer.write("操作类型: " + log.getOperationType() + "\n");
                    writer.write("模块: " + log.getModule() + "\n");
                    writer.write("操作描述: " + log.getOperationDesc() + "\n");
                    writer.write("请求方法: " + log.getRequestMethod() + "\n");
                    writer.write("请求URL: " + log.getRequestUrl() + "\n");
                    writer.write("请求参数: " + log.getRequestParams() + "\n");
                    writer.write("响应结果: " + log.getResponseResult() + "\n");
                    writer.write("IP地址: " + log.getIpAddress() + "\n");
                    writer.write("用户代理: " + log.getUserAgent() + "\n");
                    writer.write("操作时间: " + (log.getOperationTime() != null ? 
                        log.getOperationTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "") + "\n");
                    writer.write("创建时间: " + (log.getCreateTime() != null ? 
                        log.getCreateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "") + "\n");
                    writer.write("-------------------------------------\n");
                }

                writer.flush();
            }

            log.info("日志持久化到文件成功: file={}, count={}", file.getAbsolutePath(), logs.size());
        } catch (IOException e) {
            log.error("保存日志到文件失败: " + e.getMessage(), e);
        }
    }
}


package com.example.demo.interfaces.rest.system;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.demo.application.log.OperationLogService;
import com.example.demo.common.result.Result;
import com.example.demo.domain.log.entity.OperationLog;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 操作日志管理控制器
 * 需要管理员权限
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/logs")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class OperationLogController {

    @Autowired
    private OperationLogService operationLogService;

    /**
     * 分页查询日志
     */
    @GetMapping
    public Result<IPage<OperationLog>> getLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operationType,
            @RequestParam(required = false) String username) {
        IPage<OperationLog> logs = operationLogService.getLogs(page, size, module, operationType, username);
        return Result.success(logs);
    }

    /**
     * 根据ID查询日志详情
     */
    @GetMapping("/{id}")
    public Result<OperationLog> getLogById(@PathVariable String id) {
        OperationLog log = operationLogService.getLogById(id);
        if (log == null) {
            return Result.error(404, "日志不存在");
        }
        return Result.success(log);
    }

    /**
     * 导出日志（导出为TXT文件）
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportLogs(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operationType,
            @RequestParam(required = false) String username) {
        try {
            // 查询所有符合条件的日志（不分页）
            IPage<OperationLog> logsPage = operationLogService.getLogs(1, 10000, module, operationType, username);
            List<OperationLog> logs = logsPage.getRecords();

            // 生成TXT内容
            StringBuilder content = new StringBuilder();
            content.append("========== 操作日志导出 ==========\n");
            content.append("导出时间: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n");
            content.append("日志数量: ").append(logs.size()).append("\n");
            if (module != null && !module.isEmpty()) {
                content.append("模块筛选: ").append(module).append("\n");
            }
            if (operationType != null && !operationType.isEmpty()) {
                content.append("操作类型筛选: ").append(operationType).append("\n");
            }
            if (username != null && !username.isEmpty()) {
                content.append("用户名筛选: ").append(username).append("\n");
            }
            content.append("=====================================\n\n");

            for (OperationLog log : logs) {
                content.append("日志ID: ").append(log.getId()).append("\n");
                content.append("用户ID: ").append(log.getUserId()).append("\n");
                content.append("用户名: ").append(log.getUsername()).append("\n");
                content.append("操作类型: ").append(log.getOperationType()).append("\n");
                content.append("模块: ").append(log.getModule()).append("\n");
                content.append("操作描述: ").append(log.getOperationDesc()).append("\n");
                content.append("请求方法: ").append(log.getRequestMethod()).append("\n");
                content.append("请求URL: ").append(log.getRequestUrl()).append("\n");
                content.append("请求参数: ").append(log.getRequestParams()).append("\n");
                content.append("响应结果: ").append(log.getResponseResult()).append("\n");
                content.append("IP地址: ").append(log.getIpAddress()).append("\n");
                content.append("用户代理: ").append(log.getUserAgent()).append("\n");
                content.append("操作时间: ").append(log.getOperationTime() != null ?
                    log.getOperationTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "").append("\n");
                content.append("创建时间: ").append(log.getCreateDate() != null ?
                    log.getCreateDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "").append("\n");
                content.append("-------------------------------------\n");
            }

            // 转换为字节数组
            byte[] bytes = content.toString().getBytes(StandardCharsets.UTF_8);

            // 设置响应头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            headers.setContentDispositionFormData("attachment", 
                "operation_logs_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".txt");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(bytes);
        } catch (Exception e) {
            log.error("导出日志失败: " + e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}


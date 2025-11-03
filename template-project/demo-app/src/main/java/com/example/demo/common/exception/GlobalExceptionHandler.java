package com.example.demo.common.exception;

import com.example.demo.common.result.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

/**
 * 全局异常处理器
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 处理请求体解析异常（JSON格式错误等）
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException e) {
        logger.error(String.format("请求体解析失败: %s", e.getMessage()), e);
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", "请求体格式错误，请检查JSON格式");
        return ResponseEntity.badRequest().body(result);
    }

    /**
     * 处理参数绑定异常
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<Map<String, Object>> handleBindException(BindException e) {
        logger.error(String.format("参数绑定失败: %s", e.getMessage()), e);
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", "参数绑定失败: " + e.getBindingResult().getFieldErrors().get(0).getDefaultMessage());
        return ResponseEntity.badRequest().body(result);
    }

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException e) {
        logger.error(String.format("参数校验失败: %s", e.getMessage()), e);
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        if (e.getBindingResult().hasFieldErrors()) {
            result.put("message", "参数校验失败: " + e.getBindingResult().getFieldErrors().get(0).getDefaultMessage());
        } else {
            result.put("message", "参数校验失败");
        }
        return ResponseEntity.badRequest().body(result);
    }

    /**
     * 处理参数类型不匹配异常
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException e) {
        logger.error(String.format("参数类型不匹配: %s", e.getMessage()), e);
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", "参数类型不匹配: " + e.getName() + " 应为 " + (e.getRequiredType() != null ? e.getRequiredType().getSimpleName() : "未知类型"));
        return ResponseEntity.badRequest().body(result);
    }

    /**
     * 处理所有未捕获的异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        logger.error(String.format("系统异常: %s", e.getMessage()), e);
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", "系统内部错误: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
    }
}


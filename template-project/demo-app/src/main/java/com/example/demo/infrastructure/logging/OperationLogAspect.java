package com.example.demo.infrastructure.logging;

import com.example.demo.application.log.OperationLogService;
import com.example.demo.application.user.UserService;
import com.example.demo.domain.log.entity.OperationLog;
import com.example.demo.domain.user.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.Map;

/**
 * 操作日志切面
 * 记录用户的操作日志（新增、修改、删除）到数据库
 */
@Slf4j
@Aspect
@Component
public class OperationLogAspect {

    @Autowired
    private OperationLogService operationLogService;

    @Autowired
    private UserService userService;

    private final ObjectMapper objectMapper;

    public OperationLogAspect() {
        this.objectMapper = new ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /**
     * 定义切点：拦截所有 Controller 的增删改方法
     * 匹配包含 @PostMapping, @PutMapping, @DeleteMapping 的方法
     * 排除登录、注册、刷新token等认证相关接口
     */
    @Pointcut("(@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.PutMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.DeleteMapping)) && " +
              "!execution(* com.example.demo.interfaces.rest.auth.AuthController.*(..))")
    public void operationPointcut() {
    }

    /**
     * 环绕通知：记录操作日志
     */
    @Around("operationPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        // 获取请求信息
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes != null ? attributes.getRequest() : null;

        if (request == null) {
            return joinPoint.proceed();
        }

        // 获取方法信息
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        // 获取用户信息
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = null;
        String userId = null;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            username = authentication.getName();
            // 根据username查询userId
            try {
                User user = userService.getOne(
                    new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .eq("username", username));
                if (user != null) {
                    userId = user.getId();
                }
            } catch (Exception e) {
                log.warn("获取用户ID失败: " + e.getMessage());
            }
        }

        // 排除不需要记录的接口
        String requestUri = request.getRequestURI();
        if (shouldSkipLogging(requestUri)) {
            return joinPoint.proceed();
        }

        // 确定操作类型（根据HTTP方法）
        String operationType = determineOperationTypeByHttpMethod(request.getMethod());
        String module = determineModule(className, requestUri);

        // 获取请求参数
        String requestParams = getRequestParams(args);

        // 执行方法
        Object result = null;
        String responseResult = null;
        Exception exception = null;
        try {
            result = joinPoint.proceed();
            if (result != null) {
                try {
                    responseResult = objectMapper.writeValueAsString(result);
                    // 限制响应结果长度，避免过长
                    if (responseResult.length() > 2000) {
                        responseResult = responseResult.substring(0, 2000) + "...(已截断)";
                    }
                } catch (Exception e) {
                    responseResult = result.toString();
                }
            }
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            // 记录操作日志（异步记录，避免影响主流程）
            try {
                saveOperationLog(request, className, methodName, username, userId, operationType, module, 
                    requestParams, responseResult, exception == null);
            } catch (Exception e) {
                log.error("保存操作日志失败: " + e.getMessage(), e);
            }
        }

        return result;
    }

    /**
     * 判断是否跳过日志记录
     */
    private boolean shouldSkipLogging(String requestUri) {
        // 排除登录、注册、刷新token等接口
        return requestUri.contains("/auth/login") ||
               requestUri.contains("/auth/register") ||
               requestUri.contains("/auth/refresh") ||
               requestUri.contains("/auth/logout") ||
               requestUri.contains("/public/") ||
               requestUri.contains("/test/");
    }

    /**
     * 根据HTTP方法确定操作类型
     */
    private String determineOperationTypeByHttpMethod(String httpMethod) {
        if ("POST".equalsIgnoreCase(httpMethod)) {
            return "CREATE";
        } else if ("PUT".equalsIgnoreCase(httpMethod) || "PATCH".equalsIgnoreCase(httpMethod)) {
            return "UPDATE";
        } else if ("DELETE".equalsIgnoreCase(httpMethod)) {
            return "DELETE";
        } else {
            return "UNKNOWN";
        }
    }

    /**
     * 确定模块
     */
    private String determineModule(String className, String requestUri) {
        if (className.contains("User") || requestUri.contains("/users")) {
            return "用户管理";
        } else if (className.contains("Product") && !className.contains("Type")) {
            return "商品管理";
        } else if (className.contains("ProductType") || requestUri.contains("/product-types")) {
            return "商品类型管理";
        } else if (className.contains("Role")) {
            return "角色管理";
        } else if (className.contains("Security") || requestUri.contains("/security")) {
            return "安全配置";
        } else {
            return "其他";
        }
    }

    /**
     * 获取请求参数
     */
    private String getRequestParams(Object[] args) {
        if (args == null || args.length == 0) {
            return null;
        }

        try {
            Map<String, Object> params = new HashMap<>();
            for (int i = 0; i < args.length; i++) {
                Object arg = args[i];
                // 跳过HttpServletRequest等框架对象
                if (arg instanceof HttpServletRequest || arg instanceof jakarta.servlet.http.HttpServletResponse) {
                    continue;
                }
                // 过滤敏感信息（如密码）
                if (arg != null && arg.toString().contains("password")) {
                    params.put("arg" + i, "***敏感信息已隐藏***");
                } else {
                    try {
                        params.put("arg" + i, objectMapper.writeValueAsString(arg));
                    } catch (Exception e) {
                        params.put("arg" + i, arg != null ? arg.toString() : "null");
                    }
                }
            }
            return objectMapper.writeValueAsString(params);
        } catch (Exception e) {
            return "参数序列化失败: " + e.getMessage();
        }
    }

    /**
     * 保存操作日志
     */
    private void saveOperationLog(HttpServletRequest request, String className, String methodName, 
                                  String username, String userId, String operationType, String module,
                                  String requestParams, String responseResult, boolean success) {
        try {
            OperationLog operationLog = new OperationLog();
            operationLog.setUserId(userId);
            operationLog.setUsername(username);
            operationLog.setOperationType(operationType);
            operationLog.setModule(module);
            operationLog.setOperationDesc(className + "." + methodName + (success ? " 成功" : " 失败"));
            operationLog.setRequestMethod(request.getMethod());
            operationLog.setRequestUrl(request.getRequestURI());
            operationLog.setRequestParams(requestParams);
            operationLog.setResponseResult(responseResult);
            operationLog.setIpAddress(getClientIpAddress(request));
            operationLog.setUserAgent(request.getHeader("User-Agent"));
            operationLog.setOperationTime(java.time.LocalDateTime.now());
            operationLog.setCreateDate(java.time.LocalDateTime.now());

            operationLogService.saveLog(operationLog);
        } catch (Exception e) {
            log.error("保存操作日志异常: " + e.getMessage(), e);
        }
    }

    /**
     * 获取客户端IP地址
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}


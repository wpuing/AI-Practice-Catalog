package com.example.demo.infrastructure.logging;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * API 日志切面
 * 记录所有接口的访问信息，包括参数、用户信息、线程信息等
 */
@Aspect
@Component
public class ApiLogAspect {

    private static final Logger log = LoggerFactory.getLogger(ApiLogAspect.class);

    private final ObjectMapper objectMapper;

    /**
     * 注入配置好的 ObjectMapper Bean，确保支持 Java 8 时间类型
     */
    @Autowired
    public ApiLogAspect(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * 定义切点：拦截所有 Controller 的方法
     */
    @Pointcut("execution(* com.example.demo.interfaces.rest..*.*(..))")
    public void controllerPointcut() {
    }

    /**
     * 环绕通知：记录接口访问日志
     */
    @Around("controllerPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        // 获取请求信息
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes != null ? attributes.getRequest() : null;

        // 获取方法信息
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        // 获取线程信息
        Thread currentThread = Thread.currentThread();
        String threadName = currentThread.getName();
        @SuppressWarnings("deprecation")
        long threadId = currentThread.getId(); // Java 8 中使用，Java 9+ 已废弃
        
        // 获取用户信息
        Map<String, Object> userInfo = getUserInfo();
        
        // 获取请求参数（过滤敏感信息）
        Map<String, Object> params = getRequestParams(joinPoint, args);
        
        // 构建日志信息
        Map<String, Object> logInfo = new HashMap<>();
        logInfo.put("请求时间", System.currentTimeMillis());
        logInfo.put("接口路径", request != null ? request.getRequestURI() : "未知");
        logInfo.put("请求方法", request != null ? request.getMethod() : "未知");
        logInfo.put("IP地址", getClientIp(request));
        logInfo.put("类名", className);
        logInfo.put("方法名", methodName);
        logInfo.put("请求参数", params);
        logInfo.put("用户信息", userInfo);
        logInfo.put("线程信息", Map.of(
            "线程ID", threadId,
            "线程名称", threadName,
            "线程组", currentThread.getThreadGroup().getName(),
            "是否守护线程", currentThread.isDaemon(),
            "线程优先级", currentThread.getPriority()
        ));
        
        // 设置 MDC（用于日志追踪）
        MDC.put("userId", userInfo.get("用户名") != null ? userInfo.get("用户名").toString() : "anonymous");
        MDC.put("threadId", String.valueOf(threadId));
        MDC.put("requestURI", request != null ? request.getRequestURI() : "");
        
        Object result = null;
        
        try {
            // 记录请求日志
            String requestParams = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(logInfo.get("请求参数"));
            log.info(String.format("========== API 请求开始 ==========%n请求路径: %s%n请求方法: %s%n类名.方法名: %s.%s%n客户端IP: %s%n用户信息: %s%n线程信息: 线程ID=%d, 线程名=%s%n请求参数: %s", 
                logInfo.get("接口路径"),
                logInfo.get("请求方法"),
                logInfo.get("类名"),
                logInfo.get("方法名"),
                logInfo.get("IP地址"),
                logInfo.get("用户信息"),
                threadId,
                threadName,
                requestParams
            ));
            
            // 执行方法
            result = joinPoint.proceed();
            
            // 计算执行时间
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            // 构建响应日志
            Map<String, Object> responseLog = new HashMap<>();
            responseLog.put("执行时间(ms)", duration);
            responseLog.put("响应状态", "成功");
            
            // 记录响应结果（如果结果不太大）
            if (result != null) {
                String resultStr = objectMapper.writeValueAsString(result);
                if (resultStr.length() < 1000) {
                    responseLog.put("响应结果", result);
                } else {
                    responseLog.put("响应结果", "响应数据过大，已省略");
                }
            }
            
            // 记录响应日志
            String responseResult = responseLog.get("响应结果") != null ? 
                (responseLog.get("响应结果").toString().length() < 500 ? 
                    responseLog.get("响应结果").toString() : "响应数据过大，已省略") : "无";
            log.info(String.format("========== API 请求结束 ==========%n执行耗时: %dms%n响应状态: %s%n响应结果: %s", 
                duration,
                responseLog.get("响应状态"),
                responseResult
            ));
            
            return result;
            
        } catch (Throwable e) {
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            // 构建异常日志
            Map<String, Object> errorLog = new HashMap<>();
            errorLog.put("执行时间(ms)", duration);
            errorLog.put("响应状态", "异常");
            errorLog.put("异常类型", e.getClass().getName());
            errorLog.put("异常消息", e.getMessage());
            
            // 记录异常日志
            log.error(String.format("========== API 请求异常 ==========%n执行耗时: %dms%n异常类型: %s%n异常消息: %s%n", 
                duration,
                errorLog.get("异常类型"),
                errorLog.get("异常消息")
            ), e);
            
            throw e;
        } finally {
            // 清理 MDC
            MDC.clear();
        }
    }

    /**
     * 获取请求参数
     */
    private Map<String, Object> getRequestParams(ProceedingJoinPoint joinPoint, Object[] args) {
        Map<String, Object> params = new HashMap<>();
        
        if (args == null || args.length == 0) {
            return params;
        }
        
        try {
            // 获取方法参数名（需要编译时保留参数名，或使用反射获取）
            String[] paramNames = getParameterNames(joinPoint);
            
            for (int i = 0; i < args.length; i++) {
                String paramName = i < paramNames.length ? paramNames[i] : "arg" + i;
                Object arg = args[i];
                
                // 过滤敏感信息
                if (arg != null && isSensitiveParam(paramName)) {
                    params.put(paramName, "***敏感信息已隐藏***");
                } else {
                    params.put(paramName, serializeObject(arg));
                }
            }
        } catch (Exception e) {
            log.warn(String.format("获取请求参数失败: %s", e.getMessage()), e);
            params.put("error", "参数解析失败: " + e.getMessage());
        }
        
        return params;
    }

    /**
     * 序列化对象
     */
    private Object serializeObject(Object obj) {
        if (obj == null) {
            return null;
        }
        
        // 简单类型直接返回
        if (obj instanceof String || obj instanceof Number || obj instanceof Boolean) {
            return obj;
        }
        
        try {
            // 对于复杂对象，尝试 JSON 序列化
            return objectMapper.readValue(objectMapper.writeValueAsString(obj), Object.class);
        } catch (Exception e) {
            // 如果序列化失败，返回对象的 toString
            return obj.toString();
        }
    }

    /**
     * 判断是否为敏感参数
     */
    private boolean isSensitiveParam(String paramName) {
        String lowerName = paramName.toLowerCase();
        return lowerName.contains("password") 
            || lowerName.contains("pwd") 
            || lowerName.contains("secret")
            || lowerName.contains("token")
            || lowerName.contains("key");
    }

    /**
     * 获取方法参数名
     */
    private String[] getParameterNames(ProceedingJoinPoint joinPoint) {
        try {
            // 使用 Spring 的参数名解析
            org.springframework.core.DefaultParameterNameDiscoverer discoverer = 
                new org.springframework.core.DefaultParameterNameDiscoverer();
            java.lang.reflect.Method method = ((org.aspectj.lang.reflect.MethodSignature) joinPoint.getSignature()).getMethod();
            @SuppressWarnings("null")
            String[] paramNames = discoverer.getParameterNames(method);
            return paramNames != null ? paramNames : new String[0];
        } catch (Exception e) {
            log.debug(String.format("获取参数名失败，使用默认命名: %s", e.getMessage()), e);
            // 如果获取失败，使用默认命名
            Object[] args = joinPoint.getArgs();
            String[] defaultNames = new String[args != null ? args.length : 0];
            for (int i = 0; i < defaultNames.length; i++) {
                defaultNames[i] = "arg" + i;
            }
            return defaultNames;
        }
    }

    /**
     * 获取用户信息
     */
    private Map<String, Object> getUserInfo() {
        Map<String, Object> userInfo = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated()) {
                userInfo.put("用户名", authentication.getName());
                userInfo.put("是否已认证", authentication.isAuthenticated());
                userInfo.put("权限列表", authentication.getAuthorities().toString());
                userInfo.put("认证详情", authentication.getDetails() != null ? authentication.getDetails().toString() : null);
            } else {
                userInfo.put("用户名", "匿名用户");
                userInfo.put("是否已认证", false);
            }
        } catch (Exception e) {
            log.warn(String.format("获取用户信息失败: %s", e.getMessage()), e);
            userInfo.put("error", "获取用户信息失败: " + e.getMessage());
        }
        
        return userInfo;
    }

    /**
     * 获取客户端 IP
     */
    private String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return "未知";
        }
        
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
        
        // 处理多个 IP 的情况
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip != null ? ip : "未知";
    }

}


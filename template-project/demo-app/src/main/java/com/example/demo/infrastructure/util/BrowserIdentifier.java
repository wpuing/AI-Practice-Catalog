package com.example.demo.infrastructure.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * 浏览器标识工具
 * 用于生成浏览器唯一标识，区分不同的浏览器/设备
 */
@Slf4j
@Component
public class BrowserIdentifier {

    @Autowired
    private IpUtil ipUtil;

    /**
     * 根据HTTP请求生成浏览器唯一标识
     * 使用User-Agent + IP地址生成MD5哈希值作为浏览器ID
     * 
     * @param request HTTP请求
     * @return 浏览器唯一标识（32位MD5字符串）
     */
    public String generateBrowserId(HttpServletRequest request) {
        if (request == null) {
            return null;
        }

        // 获取User-Agent
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null || userAgent.trim().isEmpty()) {
            userAgent = "Unknown";
        }

        // 获取客户端IP地址
        String clientIp = ipUtil.getClientIp(request);

        // 组合信息生成唯一标识
        String combined = userAgent + "|" + clientIp;
        
        // 生成MD5哈希
        String browserId = md5Hash(combined);
        
        log.debug(String.format("生成浏览器ID: userAgent=%s, ip=%s, browserId=%s", 
            userAgent.substring(0, Math.min(50, userAgent.length())), clientIp, browserId));
        
        return browserId;
    }

    /**
     * MD5哈希
     */
    private String md5Hash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            
            // 转换为十六进制字符串
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error(String.format("MD5哈希失败: %s", e.getMessage()), e);
            // 如果MD5失败，使用简单的哈希作为备选
            return String.valueOf(input.hashCode());
        }
    }
}


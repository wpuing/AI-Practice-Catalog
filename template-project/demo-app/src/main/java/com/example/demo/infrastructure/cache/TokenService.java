package com.example.demo.infrastructure.cache;

import com.example.demo.common.constants.RedisKeyConstants;
import com.example.demo.common.constants.LogMessages;
import com.example.demo.domain.security.entity.TokenInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Token服务
 * 负责生成、保存、获取、刷新和删除Token，并处理Token的生命周期和相关限制
 */
@Slf4j
@Service
public class TokenService {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private final ObjectMapper objectMapper;

    /**
     * Token过期时间（秒），默认30分钟
     */
    @Value("${token.expire-time:1800}")
    private long expireTime;

    /**
     * Token刷新间隔（秒），默认30分钟。超过此时间未刷新则认为Token失效
     */
    @Value("${token.refresh-interval:1800}")
    private long refreshInterval;

    /**
     * Token长度，默认32位
     */
    @Value("${token.length:32}")
    private int tokenLength;

    public TokenService() {
        this.objectMapper = new ObjectMapper();
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(java.time.LocalDateTime.class,
            new LocalDateTimeSerializer(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        javaTimeModule.addDeserializer(java.time.LocalDateTime.class,
            new LocalDateTimeDeserializer(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        this.objectMapper.registerModule(javaTimeModule);
    }

    /**
     * 每个IP最多允许的用户数
     */
    @Value("${token.ip-max-users:5}")
    private int ipMaxUsers;

    /**
     * 生成32位随机Token
     */
    public String generateToken() {
        // 使用UUID去除横线，然后取指定长度
        String uuid = UUID.randomUUID().toString().replace("-", "");
        // 如果长度不够，拼接多个UUID
        while (uuid.length() < tokenLength) {
            uuid += UUID.randomUUID().toString().replace("-", "");
        }
        // 截取指定长度
        return uuid.substring(0, tokenLength);
    }

    /**
     * 保存Token到Redis
     * @param token Token值
     * @param username 用户名
     * @param userId 用户ID
     * @param roles 角色列表
     * @param permissions 权限列表
     * @param browserId 浏览器ID（可为null）
     * @param clientIp 客户端IP地址（可为null）
     */
    public void saveToken(String token, String username, String userId, List<String> roles, List<String> permissions, String browserId, String clientIp) {
        try {
            // 如果提供了浏览器ID，需要处理单浏览器单用户限制
            if (browserId != null && !browserId.trim().isEmpty()) {
                // 1. 检查该浏览器是否已有其他用户的token，如果有则删除
                String browserTokenKey = RedisKeyConstants.getBrowserTokenKey(browserId);
                String existingToken = redisTemplate.opsForValue().get(browserTokenKey);
                if (existingToken != null && !existingToken.equals(token)) {
                    log.info(String.format(LogMessages.Token.BROWSER_HAS_OTHER_USER, browserId, existingToken));
                    deleteToken(existingToken);
                }
                
                // 2. 检查该用户是否在该浏览器已有token，如果有则删除
                String userBrowserKey = RedisKeyConstants.getUserBrowserKey(userId, browserId);
                String existingUserToken = redisTemplate.opsForValue().get(userBrowserKey);
                if (existingUserToken != null && !existingUserToken.equals(token)) {
                    log.info(String.format(LogMessages.Token.USER_HAS_BROWSER_TOKEN, 
                        userId, browserId, existingUserToken));
                    deleteToken(existingUserToken);
                }
            }

            // 如果提供了客户端IP，需要处理IP限制
            if (clientIp != null && !clientIp.trim().isEmpty()) {
                // 1. 检查同一IP下同一用户是否已有token，如果有则删除
                String ipUserTokenKey = RedisKeyConstants.getIpUserTokenKey(clientIp, userId);
                String existingIpUserToken = redisTemplate.opsForValue().get(ipUserTokenKey);
                if (existingIpUserToken != null && !existingIpUserToken.equals(token)) {
                    log.info(String.format(LogMessages.Token.IP_USER_HAS_TOKEN, 
                        clientIp, userId, existingIpUserToken));
                    deleteToken(existingIpUserToken);
                }

                // 2. 检查同一IP下的用户数量，如果>=5个，删除最旧的token
                String ipUsersKey = RedisKeyConstants.getIpUsersKey(clientIp);
                Long userCount = redisTemplate.opsForSet().size(ipUsersKey);
                
                if (userCount != null && userCount >= ipMaxUsers) {
                    // 检查当前用户是否已经在IP用户列表中
                    Boolean isMember = redisTemplate.opsForSet().isMember(ipUsersKey, userId);
                    
                    if (isMember == null || !isMember) {
                        // 当前用户不在列表中，需要删除一个旧的用户token
                        // 获取所有用户ID，找到最旧的一个
                        Set<String> userIds = redisTemplate.opsForSet().members(ipUsersKey);
                        if (userIds != null && !userIds.isEmpty()) {
                            // 找到最旧的token（通过查找创建时间最早的）
                            String oldestUserId = null;
                            LocalDateTime oldestTime = null;
                            
                            for (String uid : userIds) {
                                String ipUserKey = RedisKeyConstants.getIpUserTokenKey(clientIp, uid);
                                String userToken = redisTemplate.opsForValue().get(ipUserKey);
                                if (userToken != null) {
                                    TokenInfo info = getTokenInfo(userToken);
                                    if (info != null && info.getCreateTime() != null) {
                                        if (oldestTime == null || info.getCreateTime().isBefore(oldestTime)) {
                                            oldestTime = info.getCreateTime();
                                            oldestUserId = uid;
                                        }
                                    }
                                }
                            }
                            
                            // 删除最旧的token
                            if (oldestUserId != null) {
                                String oldestIpUserKey = RedisKeyConstants.getIpUserTokenKey(clientIp, oldestUserId);
                                String oldestToken = redisTemplate.opsForValue().get(oldestIpUserKey);
                                if (oldestToken != null) {
                                    log.info(String.format(LogMessages.Token.IP_MAX_USERS_REACHED, 
                                        clientIp, oldestUserId, oldestToken));
                                    deleteToken(oldestToken);
                                }
                            }
                        }
                    }
                }
            }

            TokenInfo tokenInfo = new TokenInfo();
            tokenInfo.setToken(token);
            tokenInfo.setUsername(username);
            tokenInfo.setUserId(userId);
            tokenInfo.setRoles(roles);
            tokenInfo.setPermissions(permissions);
            tokenInfo.setCreateTime(LocalDateTime.now());
            tokenInfo.setLastRefreshTime(LocalDateTime.now());
            tokenInfo.setExpireTime(LocalDateTime.now().plusSeconds(expireTime));

            // 将TokenInfo转换为JSON字符串存储
            String tokenJson = objectMapper.writeValueAsString(tokenInfo);
            
            // 存储token信息，设置过期时间
            String tokenKey = RedisKeyConstants.getTokenKey(token);
            redisTemplate.opsForValue().set(tokenKey, tokenJson, expireTime, TimeUnit.SECONDS);
            
            // 存储用户到token的映射（用于快速查找和强制下线）
            String userTokenKey = RedisKeyConstants.getUserTokenKey(username);
            redisTemplate.opsForValue().set(userTokenKey, token, expireTime, TimeUnit.SECONDS);

            // 如果提供了浏览器ID，保存浏览器相关的映射
            if (browserId != null && !browserId.trim().isEmpty()) {
                // 存储浏览器到token的映射
                String browserTokenKey = RedisKeyConstants.getBrowserTokenKey(browserId);
                redisTemplate.opsForValue().set(browserTokenKey, token, expireTime, TimeUnit.SECONDS);
                
                // 存储用户浏览器到token的映射
                String userBrowserKey = RedisKeyConstants.getUserBrowserKey(userId, browserId);
                redisTemplate.opsForValue().set(userBrowserKey, token, expireTime, TimeUnit.SECONDS);
            }

            // 如果提供了客户端IP，保存IP相关的映射
            if (clientIp != null && !clientIp.trim().isEmpty()) {
                // 存储IP用户到token的映射
                String ipUserTokenKey = RedisKeyConstants.getIpUserTokenKey(clientIp, userId);
                redisTemplate.opsForValue().set(ipUserTokenKey, token, expireTime, TimeUnit.SECONDS);
                
                // 将用户ID添加到IP用户列表中
                String ipUsersKey = RedisKeyConstants.getIpUsersKey(clientIp);
                redisTemplate.opsForSet().add(ipUsersKey, userId);
                redisTemplate.expire(ipUsersKey, expireTime, TimeUnit.SECONDS);
            }

            log.info(String.format(LogMessages.Token.SAVE_SUCCESS, 
                token, username, browserId, clientIp, expireTime));
        } catch (Exception e) {
            log.error(String.format(LogMessages.Token.SAVE_FAILED, e.getMessage()), e);
            throw new RuntimeException("保存Token失败", e);
        }
    }

    /**
     * 从Redis获取Token信息
     */
    public TokenInfo getTokenInfo(String token) {
        try {
            String tokenKey = RedisKeyConstants.getTokenKey(token);
            String tokenJson = redisTemplate.opsForValue().get(tokenKey);
            
            if (tokenJson == null || tokenJson.isEmpty()) {
                log.debug(String.format(LogMessages.Token.NOT_FOUND_OR_EXPIRED, token));
                return null;
            }

            TokenInfo tokenInfo = objectMapper.readValue(tokenJson, TokenInfo.class);
            
            // 检查是否超过刷新间隔未刷新（30分钟无刷新则失效）
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime lastRefresh = tokenInfo.getLastRefreshTime();
            if (lastRefresh != null && now.isAfter(lastRefresh.plusSeconds(refreshInterval))) {
                log.info(String.format(LogMessages.Token.EXPIRED_NO_REFRESH, 
                    token, lastRefresh, now));
                // 自动删除失效的token及其所有相关映射
                deleteToken(token);
                return null;
            }

            return tokenInfo;
        } catch (Exception e) {
            log.error(String.format(LogMessages.Token.GET_INFO_FAILED, e.getMessage()), e);
            return null;
        }
    }

    /**
     * 刷新Token（更新最后刷新时间）
     */
    public boolean refreshToken(String token) {
        try {
            TokenInfo tokenInfo = getTokenInfo(token);
            if (tokenInfo == null) {
                log.warn(String.format(LogMessages.Token.REFRESH_FAILED_NOT_FOUND, token));
                return false;
            }

            // 更新最后刷新时间和过期时间
            tokenInfo.setLastRefreshTime(LocalDateTime.now());
            tokenInfo.setExpireTime(LocalDateTime.now().plusSeconds(expireTime));

            // 重新保存到Redis
            String tokenJson = objectMapper.writeValueAsString(tokenInfo);
            String tokenKey = RedisKeyConstants.getTokenKey(token);
            redisTemplate.opsForValue().set(tokenKey, tokenJson, expireTime, TimeUnit.SECONDS);

            // 更新用户token映射的过期时间
            String userTokenKey = RedisKeyConstants.getUserTokenKey(tokenInfo.getUsername());
            redisTemplate.expire(userTokenKey, expireTime, TimeUnit.SECONDS);

            log.info(String.format(LogMessages.Token.REFRESH_SUCCESS, token, tokenInfo.getUsername()));
            return true;
        } catch (Exception e) {
            log.error(String.format(LogMessages.Token.REFRESH_FAILED, e.getMessage()), e);
            return false;
        }
    }

    /**
     * 删除Token
     */
    public boolean deleteToken(String token) {
        try {
            TokenInfo tokenInfo = getTokenInfo(token);
            if (tokenInfo != null) {
                // 删除token
                String tokenKey = RedisKeyConstants.getTokenKey(token);
                redisTemplate.delete(tokenKey);
                
                // 删除用户token映射
                String userTokenKey = RedisKeyConstants.getUserTokenKey(tokenInfo.getUsername());
                redisTemplate.delete(userTokenKey);
                
                // 查找并删除浏览器相关的映射（通过遍历所有浏览器token来查找）
                // 注意：这里使用keys操作，在生产环境中如果数据量大，可以考虑使用其他方式
                try {
                    Set<String> browserKeys = redisTemplate.keys(RedisKeyConstants.Token.BROWSER_TOKEN + "*");
                    if (browserKeys != null) {
                        for (String browserKey : browserKeys) {
                            String browserToken = redisTemplate.opsForValue().get(browserKey);
                            if (token.equals(browserToken)) {
                                redisTemplate.delete(browserKey);
                                log.debug(String.format(LogMessages.Token.DELETE_BROWSER_MAPPING, browserKey));
                            }
                        }
                    }
                    
                    // 删除用户浏览器token映射
                    String userBrowserPattern = RedisKeyConstants.Token.USER_BROWSER + tokenInfo.getUserId() + ":*";
                    Set<String> userBrowserKeys = redisTemplate.keys(userBrowserPattern);
                    if (userBrowserKeys != null) {
                        for (String userBrowserKey : userBrowserKeys) {
                            String userBrowserToken = redisTemplate.opsForValue().get(userBrowserKey);
                            if (token.equals(userBrowserToken)) {
                                redisTemplate.delete(userBrowserKey);
                                log.debug(String.format(LogMessages.Token.DELETE_USER_BROWSER_MAPPING, userBrowserKey));
                            }
                        }
                    }

                    // 查找并删除IP相关的映射
                    Set<String> ipUserKeys = redisTemplate.keys(RedisKeyConstants.Token.IP_USER_TOKEN + "*");
                    if (ipUserKeys != null) {
                        for (String ipUserKey : ipUserKeys) {
                            String ipUserToken = redisTemplate.opsForValue().get(ipUserKey);
                            if (token.equals(ipUserToken)) {
                                redisTemplate.delete(ipUserKey);
                                
                                // 从IP用户列表中移除该用户
                                // 从key中提取IP和userId: ip_user_token:{ip}:{userId}
                                String[] parts = ipUserKey.substring(RedisKeyConstants.Token.IP_USER_TOKEN.length()).split(":", 2);
                                if (parts.length == 2) {
                                    String ip = parts[0];
                                    String userId = parts[1];
                                    String ipUsersKey = RedisKeyConstants.getIpUsersKey(ip);
                                    redisTemplate.opsForSet().remove(ipUsersKey, userId);
                                    log.debug(String.format(LogMessages.Token.REMOVE_USER_FROM_IP, ip, userId));
                                }
                                
                                log.debug(String.format(LogMessages.Token.DELETE_IP_USER_MAPPING, ipUserKey));
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn(String.format(LogMessages.Token.DELETE_MAPPING_ERROR, e.getMessage()));
                }
                
                log.info(String.format(LogMessages.Token.DELETE_SUCCESS, token, tokenInfo.getUsername()));
            }
            return true;
        } catch (Exception e) {
            log.error(String.format(LogMessages.Token.DELETE_FAILED, e.getMessage()), e);
            return false;
        }
    }

    /**
     * 根据用户名删除Token（强制下线）
     */
    public boolean deleteTokenByUsername(String username) {
        try {
            String userTokenKey = RedisKeyConstants.getUserTokenKey(username);
            String token = redisTemplate.opsForValue().get(userTokenKey);
            if (token != null) {
                return deleteToken(token);
            }
            return true;
        } catch (Exception e) {
            log.error(String.format(LogMessages.Token.DELETE_BY_USERNAME_FAILED, e.getMessage()), e);
            return false;
        }
    }

    /**
     * 删除用户的所有登录信息（包括所有浏览器、IP等相关的token）
     * @param userId 用户ID
     * @param username 用户名
     */
    public void deleteAllUserTokens(String userId, String username) {
        try {
            log.info(String.format(LogMessages.Token.DELETE_ALL_START, userId, username));
            
            // 1. 删除用户的主要token
            String userTokenKey = RedisKeyConstants.getUserTokenKey(username);
            String mainToken = redisTemplate.opsForValue().get(userTokenKey);
            if (mainToken != null) {
                deleteToken(mainToken);
            }

            // 2. 删除用户在所有浏览器的token
            String userBrowserPattern = RedisKeyConstants.Token.USER_BROWSER + userId + ":*";
            Set<String> userBrowserKeys = redisTemplate.keys(userBrowserPattern);
            if (userBrowserKeys != null && !userBrowserKeys.isEmpty()) {
                for (String userBrowserKey : userBrowserKeys) {
                    String token = redisTemplate.opsForValue().get(userBrowserKey);
                    if (token != null && !token.equals(mainToken)) {
                        deleteToken(token);
                    }
                    redisTemplate.delete(userBrowserKey);
                }
                log.debug(String.format(LogMessages.Token.DELETE_USER_BROWSER_COUNT, userBrowserKeys.size()));
            }

            // 3. 删除用户在所有IP的token
            Set<String> ipUserKeys = redisTemplate.keys(RedisKeyConstants.Token.IP_USER_TOKEN + "*");
            if (ipUserKeys != null && !ipUserKeys.isEmpty()) {
                for (String ipUserKey : ipUserKeys) {
                    // 检查key格式: ip_user_token:{ip}:{userId}
                    String keySuffix = ipUserKey.substring(RedisKeyConstants.Token.IP_USER_TOKEN.length());
                    String[] parts = keySuffix.split(":", 2);
                    if (parts.length == 2 && parts[1].equals(userId)) {
                        String token = redisTemplate.opsForValue().get(ipUserKey);
                        if (token != null && !token.equals(mainToken)) {
                            deleteToken(token);
                        }
                        redisTemplate.delete(ipUserKey);
                        
                        // 从IP用户列表中移除该用户
                        String ip = parts[0];
                        String ipUsersKey = RedisKeyConstants.getIpUsersKey(ip);
                        redisTemplate.opsForSet().remove(ipUsersKey, userId);
                        log.debug(String.format(LogMessages.Token.REMOVE_USER_FROM_IP, ip, userId));
                    }
                }
            }

            // 4. 删除浏览器token映射中该用户的token
            Set<String> browserKeys = redisTemplate.keys(RedisKeyConstants.Token.BROWSER_TOKEN + "*");
            if (browserKeys != null && !browserKeys.isEmpty()) {
                for (String browserKey : browserKeys) {
                    String browserToken = redisTemplate.opsForValue().get(browserKey);
                    if (browserToken != null) {
                        TokenInfo tokenInfo = getTokenInfo(browserToken);
                        if (tokenInfo != null && (tokenInfo.getUserId().equals(userId) || tokenInfo.getUsername().equals(username))) {
                            deleteToken(browserToken);
                        }
                    }
                }
            }

            log.info(String.format(LogMessages.Token.DELETE_ALL_SUCCESS, userId, username));
        } catch (Exception e) {
            log.error(String.format(LogMessages.Token.DELETE_ALL_FAILED, 
                userId, username, e.getMessage()), e);
        }
    }

    /**
     * 检查Token是否存在且有效
     */
    public boolean isTokenValid(String token) {
        TokenInfo tokenInfo = getTokenInfo(token);
        return tokenInfo != null;
    }

    /**
     * 获取用户的所有角色
     */
    public List<String> getRoles(String token) {
        TokenInfo tokenInfo = getTokenInfo(token);
        return tokenInfo != null ? tokenInfo.getRoles() : List.of();
    }

    /**
     * 获取用户的所有权限
     */
    public List<String> getPermissions(String token) {
        TokenInfo tokenInfo = getTokenInfo(token);
        return tokenInfo != null ? tokenInfo.getPermissions() : List.of();
    }
}


package com.example.demo.infrastructure.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret:demospringbootsecretkey123456789012345678901234567890}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private Long expiration;

    /**
     * 获取签名密钥
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes();
        // HS512 需要至少 64 字节的密钥
        if (keyBytes.length < 64) {
            byte[] expandedKey = new byte[64];
            System.arraycopy(keyBytes, 0, expandedKey, 0, Math.min(keyBytes.length, 64));
            return Keys.hmacShaKeyFor(expandedKey);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 生成Token
     */
    public String generateToken(String username, String userId, String roles) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", username);
        claims.put("userId", userId);
        claims.put("roles", roles);
        return createToken(claims, username);
    }

    /**
     * 创建Token
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * 从Token中获取用户名
     */
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    /**
     * 从Token中获取用户ID
     */
    public String getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return (String) claims.get("userId");
    }

    /**
     * 从Token中获取角色
     */
    public String getRolesFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return (String) claims.get("roles");
    }

    /**
     * 获取Token过期时间
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    /**
     * 从Token中获取Claim
     */
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * 从Token中获取所有Claims
     */
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 验证Token是否过期
     */
    public Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    /**
     * 验证Token
     */
    public Boolean validateToken(String token, String username) {
        try {
            final String tokenUsername = getUsernameFromToken(token);
            return (tokenUsername.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }
}


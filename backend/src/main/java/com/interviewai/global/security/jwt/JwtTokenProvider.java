package com.interviewai.global.security.jwt;

import java.util.Base64;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.interviewai.domain.user.entity.SubscriptionType;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.micrometer.common.util.StringUtils;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class JwtTokenProvider {
    
    @Value("${jwt.secret}") private String envKey;
    @Value("${jwt.access-token-validity}") private long envExpired;
    
    private SecretKey key;
    private long expired;
    
    @PostConstruct
    public void init() {
        String encodedKey = Base64.getEncoder().encodeToString(envKey.getBytes());
        key = Keys.hmacShaKeyFor(encodedKey.getBytes());
        expired = envExpired;
    }

    public String createJWT(Long userId, String email, SubscriptionType subscriptionType) {
        if(StringUtils.isBlank(email) || userId < 0 || subscriptionType == null) return null;
        Date now = new Date();
        Date validity = new Date(now.getTime() + expired);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("subscriptionType", subscriptionType)
                .issuedAt(now)
                .expiration(validity)
                .signWith(key)
                .compact();
    }

    public String createRefreshToken() {
        return UUID.randomUUID().toString();
    }

    public String resolveToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if(!StringUtils.isBlank(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getUserId(String token) {
        return Long.parseLong(getClaims(token).getSubject());
    }
    public String getUserEmail(String token) {
        return getClaims(token).get("email", String.class);
    }
    public SubscriptionType getUserSubscriptionType(String token) {
        String subscriptionTypeStr = getClaims(token).get("subscriptionType", String.class);
        return SubscriptionType.valueOf(subscriptionTypeStr);
    }
}

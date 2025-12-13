package com.interviewai.infra.redis;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Repository
public class RefreshTokenRepository {
    
    private final RedisTemplate<String, String> redisTemplate;

    @Value("${jwt.refresh-token-validity}") Long ttl;

    public void save(String refreshToken, Long userId) {
        redisTemplate.opsForValue().set(refreshToken, userId.toString(), ttl, TimeUnit.MILLISECONDS);
    }

    public String findByRefreshToken(String refreshToken) {
        return redisTemplate.opsForValue().get(refreshToken);
    }

    public boolean deleteByRefreshToken(String refreshToken) {
        return redisTemplate.delete(refreshToken);
    }
}

package com.interviewai.infra.redis;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Repository
public class EmailTokenRepository {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String EMAIL_VERIFY_PREFIX = "email:verify";
    private static final String PASSWORD_RESET_PREFIX = "email:reset";
    private static final String DELETE_ACCOUNT_PREFIX = "email:delete";
    private static final long TTL_MINUTES = 10;

    // 이메일 인증 토큰 저장
    public void saveEmailVerificationToken(String token, Long userId) {
        String key = EMAIL_VERIFY_PREFIX + token;
        redisTemplate.opsForValue().set(key, userId.toString(), TTL_MINUTES, TimeUnit.MINUTES);
    }

    // 이메일 인증 토큰 조회
    public Long findUserIdByVerificationToken(String token) {
        String key = EMAIL_VERIFY_PREFIX + token;
        String userId = redisTemplate.opsForValue().get(key);
        return userId != null ? Long.parseLong(userId) : null;
    }

    // 이메일 인증 토큰 삭제 (사용 처리)
    public boolean deleteEmailVerificationToken(String token) {
        String key = EMAIL_VERIFY_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.delete(key));
    }

    // 이메일 인증 토큰 존재 여부
    public boolean existsEmailVerificationToken(String token) {
        String key = EMAIL_VERIFY_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    // 비밀번호 재설정 토큰 저장
    public void savePasswordResetToken(String token, Long userId) {
        String key = PASSWORD_RESET_PREFIX + token;
        redisTemplate.opsForValue().set(key, userId.toString(), TTL_MINUTES, TimeUnit.MINUTES);
    }

    // 비밀번호 재설정 토큰 조회
    public Long findUserIdByPasswordResetToken(String token) {
        String key = PASSWORD_RESET_PREFIX + token;
        String userId = redisTemplate.opsForValue().get(key);
        return userId != null ? Long.parseLong(userId) : null;
    }

    // 비밀번호 재설정 토큰 삭제 (사용 처리)
    public boolean deletePasswordResetToken(String token) {
        String key = PASSWORD_RESET_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.delete(key));
    }

    // 비밀번호 재설정 토큰 존재 여부
    public boolean existsPasswordResetToken(String token) {
        String key = PASSWORD_RESET_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public void saveDeleteAccountToken(String token, Long userId) {
        String key = DELETE_ACCOUNT_PREFIX + token;
        redisTemplate.opsForValue().set(key, userId.toString(), TTL_MINUTES, TimeUnit.MINUTES);
    }

    public Long findUserIdByDeleteAccountToken(String token) {
        String key = DELETE_ACCOUNT_PREFIX + token;
        String userId = redisTemplate.opsForValue().get(key);
        return userId != null ? Long.parseLong(userId) : null;
    }

    public boolean deleteDeleteAccountToken(String token) {
        String key = DELETE_ACCOUNT_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.delete(key));
    }

    public boolean existsDeleteAccountToken(String token) {
        String key = DELETE_ACCOUNT_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
# Redis 기초

> 작성일: 2024-12-13
> Phase: 2 (인증 시스템) - Task 7

---

## 1. Redis란?

**Remote Dictionary Server**의 약자로, **인메모리 데이터 저장소**입니다.

### 특징
- **메모리 기반**: 디스크가 아닌 RAM에 저장 → 매우 빠름
- **Key-Value 구조**: `key: value` 형태로 저장
- **TTL 지원**: 데이터에 만료 시간 설정 가능

---

## 2. Redis vs 일반 DB 비교

| 항목 | Redis | MySQL/MariaDB |
|------|-------|---------------|
| 저장 위치 | 메모리 (RAM) | 디스크 |
| 속도 | 매우 빠름 | 상대적으로 느림 |
| 데이터 구조 | Key-Value | 테이블 (행/열) |
| 용도 | 캐시, 세션, 임시 데이터 | 영구 데이터 |
| 데이터 유지 | 서버 재시작 시 삭제 (기본) | 영구 보존 |

---

## 3. Redis를 Refresh Token에 사용하는 이유

### 3.1 빠른 조회
- 토큰 갱신 시 Redis 조회 → 밀리초 단위
- DB 조회보다 10~100배 빠름

### 3.2 TTL (Time To Live)
```
Redis에 저장할 때: "이 데이터는 7일 후 자동 삭제해줘"
→ 별도 삭제 로직 불필요
```

### 3.3 적합한 용도
- Refresh Token은 **임시 데이터** (7일 후 만료)
- 영구 저장 필요 없음
- 빠른 조회 필요

---

## 4. Redis 데이터 저장 방식

### Key-Value 예시
```
Key: "RT:123"        → 사용자 ID 123의 Refresh Token
Value: "abc123xyz"   → 실제 토큰 값
TTL: 604800초        → 7일 후 자동 삭제
```

### 명령어
```bash
SET RT:123 "abc123xyz" EX 604800   # 저장 (7일 TTL)
GET RT:123                          # 조회
DEL RT:123                          # 삭제
```

---

## 5. Spring Boot + Redis 연동

### 5.1 의존성 (build.gradle)
```gradle
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```
→ 이미 추가되어 있음!

### 5.2 설정 (application.yml)
```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
```
→ 이미 추가되어 있음!

### 5.3 RedisConfig.java

```java
@Configuration
public class RedisConfig {

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory();
    }

    @Bean
    public RedisTemplate<String, String> redisTemplate(
            RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }
}
```

**설명**:
- `LettuceConnectionFactory`: Redis 연결 담당 (Lettuce = Redis 클라이언트 라이브러리)
- `RedisTemplate`: Redis 명령어 실행 도구
- `StringRedisSerializer`: Key/Value를 문자열로 직렬화

---

## 6. RedisTemplate 사용법

### 6.1 저장 (SET)
```java
// RT:123 = "tokenValue", 7일 TTL
redisTemplate.opsForValue().set(
    "RT:" + userId,
    tokenValue,
    7,
    TimeUnit.DAYS
);
```

### 6.2 조회 (GET)
```java
String token = redisTemplate.opsForValue().get("RT:" + userId);
```

### 6.3 삭제 (DEL)
```java
redisTemplate.delete("RT:" + userId);
```

### 6.4 존재 확인
```java
Boolean exists = redisTemplate.hasKey("RT:" + userId);
```

---

## 7. 로컬에서 Redis 실행

### Windows (Docker 사용)
```bash
docker run -d -p 6379:6379 --name redis redis
```

### Mac (Homebrew)
```bash
brew install redis
brew services start redis
```

### 실행 확인
```bash
redis-cli ping
# 응답: PONG
```

---

## 8. 현재 프로젝트 적용

```
로그인 시:
1. Access Token 생성 (JWT)
2. Refresh Token 생성 (UUID)
3. Redis에 저장: RT:{userId} = {refreshToken}, TTL 7일

토큰 갱신 시:
1. Redis에서 RT:{userId} 조회
2. 요청의 RT와 비교
3. 일치하면 새 AT + 새 RT 발급
4. Redis 업데이트

로그아웃 시:
1. Redis에서 RT:{userId} 삭제
```

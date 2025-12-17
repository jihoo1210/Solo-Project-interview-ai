# AWS ElastiCache Serverless (Valkey/Redis) 연결 오류 해결

## 1. 문제 상황

### 증상
- 로컬에서는 Redis 연결 정상
- AWS Elastic Beanstalk 배포 후 `RedisConnectionFailureException` 발생
- 회원가입 시 이메일 토큰 저장 실패

### 에러 로그
```
UnhandledException: RedisConnectionFailureException - Unable to connect to Redis
at com.interviewai.infra.redis.EmailTokenRepository.existsEmailVerificationToken
```

---

## 2. 트러블슈팅 과정

### 2.1 네트워크 연결 확인

**DNS 확인:**
```bash
nslookup interbit-valkey-xxx.serverless.apn2.cache.amazonaws.com
```
- 결과: 172.31.x.x IP들로 정상 resolve (같은 VPC 내부 IP)

**일반 TCP 연결 테스트 (실패):**
```bash
timeout 5 bash -c 'cat < /dev/tcp/172.31.46.139/6379' && echo "Connected" || echo "Failed"
# 결과: Failed
```

**TLS 연결 테스트 (성공):**
```bash
openssl s_client -connect interbit-valkey-xxx.serverless.apn2.cache.amazonaws.com:6379 -servername interbit-valkey-xxx.serverless.apn2.cache.amazonaws.com
# 결과: CONNECTED, Verify return code: 0 (ok)
```

### 2.2 결론
- **네트워크/보안그룹은 정상**
- **TLS 연결은 성공** (Serverless ElastiCache는 TLS 필수)
- **Spring Boot 설정 문제**로 판단

---

## 3. 근본 원인

### 문제가 된 코드 (`RedisConfig.java`)
```java
@Configuration
public class RedisConfig {

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory();  // 문제!
    }

    @Primary
    @Bean
    RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        // ...
    }
}
```

### 왜 문제인가?
`new LettuceConnectionFactory()`를 직접 생성하면:
- `application.yml`의 `spring.data.redis.host`, `port`, `ssl.enabled` 설정이 **완전히 무시됨**
- 기본값인 `localhost:6379`에 **SSL 없이** 연결 시도
- Serverless ElastiCache는 **TLS 필수**이므로 연결 실패

### application.yml 설정 (무시되던 설정)
```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      ssl:
        enabled: true  # 이 설정이 무시됨!
```

---

## 4. 해결 방법

### 수정된 코드
```java
@Configuration
public class RedisConfig {

    @Primary
    @Bean
    RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }
}
```

### 핵심 변경사항
- `redisConnectionFactory()` Bean **제거**
- Spring Boot 자동 설정(Auto Configuration)이 `application.yml` 읽어서 `LettuceConnectionFactory` 생성
- `RedisTemplate`은 주입받은 `connectionFactory` 사용

---

## 5. Spring Boot Redis 자동 설정 원리

### 자동 설정 클래스
- `RedisAutoConfiguration`
- `LettuceConnectionConfiguration`

### 작동 방식
1. `spring.data.redis.*` 프로퍼티를 `RedisProperties`로 바인딩
2. `LettuceConnectionConfiguration`이 `RedisProperties` 읽어서 `LettuceConnectionFactory` 생성
3. SSL 설정, 호스트, 포트 등 모두 자동 적용

### 주의사항
- **직접 `@Bean`으로 `RedisConnectionFactory` 정의하면 자동 설정 무시됨**
- 커스텀 설정이 필요한 경우 `LettuceClientConfigurationBuilder` 사용

---

## 6. AWS ElastiCache Serverless 특이사항

### TLS 필수
- Serverless ElastiCache는 **항상 TLS 활성화**
- `spring.data.redis.ssl.enabled: true` 필수

### 환경변수 설정 (Elastic Beanstalk)
```
REDIS_HOST=interbit-valkey-xxx.serverless.apn2.cache.amazonaws.com
REDIS_PORT=6379
```

### 보안그룹 설정
- Valkey 보안그룹 인바운드: EC2 보안그룹 ID에서 6379 허용
- EC2 보안그룹 아웃바운드: 6379 또는 All traffic 허용

---

## 7. 체크리스트

### 연결 안 될 때 확인 순서
1. **DNS resolve 확인**: `nslookup [엔드포인트]`
2. **TLS 연결 테스트**: `openssl s_client -connect [엔드포인트]:6379`
3. **VPC/서브넷 확인**: EC2와 ElastiCache가 같은 VPC인지
4. **보안그룹 확인**: 인바운드/아웃바운드 규칙
5. **Spring Boot 설정 확인**: 직접 Bean 생성하는 코드 있는지

### 핵심
> **`RedisConnectionFactory`를 직접 `@Bean`으로 정의하면 `application.yml` 설정이 무시된다!**

---

## 8. 참고 자료

- [Spring Data Redis Reference](https://docs.spring.io/spring-data/redis/reference/)
- [AWS ElastiCache Serverless 문서](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/Serverless.html)
- [Lettuce SSL 설정](https://lettuce.io/core/release/reference/#ssl)

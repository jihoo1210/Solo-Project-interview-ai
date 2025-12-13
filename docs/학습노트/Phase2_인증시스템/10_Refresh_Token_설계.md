# Refresh Token 설계

> 작성일: 2024-12-13
> Phase: 2 (인증 시스템) - Task 7

---

## 1. 시작 전 질문

### Q1. Access Token vs Refresh Token 차이?

| 항목 | Access Token | Refresh Token |
|------|--------------|---------------|
| 용도 | API 인증 | Access Token 재발급 |
| 만료 시간 | 짧음 (15분~1시간) | 김 (7일~30일) |
| 저장 위치 | 메모리/localStorage | HttpOnly Cookie 또는 DB/Redis |
| 탈취 시 위험도 | 높음 (짧은 유효기간으로 완화) | 매우 높음 (장기 유효) |

---

### Q2. Refresh Token 저장 위치?

| 위치 | 장점 | 단점 |
|------|------|------|
| **Redis** | 빠른 조회, TTL 자동 만료 | 추가 인프라 필요 |
| **DB** | 별도 인프라 불필요 | 조회 성능 낮음 |
| **HttpOnly Cookie** | XSS 공격 방지 | CSRF 취약 |

**현재 프로젝트 선택**: Redis
- 빠른 토큰 검증
- TTL로 자동 만료 처리
- 로그아웃 시 즉시 삭제 가능

---

### Q3. 토큰 갱신 흐름?

```
1. 클라이언트: Access Token 만료됨
2. 클라이언트: Refresh Token으로 /auth/refresh 요청
3. 서버: Refresh Token 검증 (Redis에서 조회)
4. 서버: 새 Access Token + 새 Refresh Token 발급
5. 서버: 기존 Refresh Token 삭제, 새 Refresh Token 저장
6. 클라이언트: 새 토큰으로 교체
```

---

### Q4. Refresh Token Rotation이란?

토큰 갱신 시 **Refresh Token도 새로 발급**하는 방식

**장점**:
- 탈취된 토큰 재사용 감지 가능
- 보안 강화

**단점**:
- 구현 복잡도 증가

**현재 프로젝트**: Rotation 적용

---

## 2. Task 7 설계 결정

| 항목 | 결정 |
|------|------|
| Refresh Token 저장 | Redis |
| Access Token 만료 | 30분 |
| Refresh Token 만료 | 7일 |
| Rotation | 적용 (갱신 시 새 RT 발급) |
| 로그아웃 | Redis에서 RT 삭제 |

---

## 3. 토큰 무효화: 삭제 vs 짧은 만료

### Access Token - 짧은 만료로 처리

**왜 삭제하지 않나?**
- JWT는 **Stateless** (서버에 저장 안 함)
- 삭제하려면 **블랙리스트**를 관리해야 함 (Redis에 저장)
- 모든 요청마다 블랙리스트 조회 필요 → 성능 저하

**짧은 만료의 의미**:
```
로그아웃 시점: 10:00
AT 만료 시간: 10:30 (30분 후)

→ 최악의 경우 30분간 탈취된 토큰 사용 가능
→ 하지만 대부분의 서비스에서 허용 가능한 위험
```

**블랙리스트가 필요한 경우**:
- 금융, 의료 등 보안이 매우 중요한 서비스
- 즉시 토큰 무효화가 필수인 경우

---

### Refresh Token - 삭제로 처리

**왜 삭제하나?**
- RT는 **서버에 저장**함 (Redis/DB)
- 삭제하면 즉시 무효화 가능
- 갱신 시점에만 조회하므로 성능 영향 적음

**삭제의 의미**:
```
로그아웃 시점: 10:00
Redis에서 RT 삭제

→ 사용자가 /refresh 요청 시 "토큰 없음" 에러
→ 새 AT 발급 불가 → 강제 재로그인
```

---

### 비교 정리

| 항목 | Access Token | Refresh Token |
|------|--------------|---------------|
| 저장 | 클라이언트만 | 서버 (Redis) |
| 무효화 방식 | 짧은 만료 (또는 블랙리스트) | 삭제 |
| 로그아웃 후 | 만료까지 유효 | 즉시 무효 |
| 보안 위험 | 30분간 사용 가능 | 없음 |

---

### 현재 프로젝트 적용

```
로그아웃 시:
1. Refresh Token → Redis에서 삭제 (즉시 무효화)
2. Access Token → 클라이언트가 삭제 (만료까지는 서버에서 유효)
```

**왜 AT 블랙리스트를 안 쓰나?**
- 30분 만료면 위험 수준 낮음
- 매 요청마다 Redis 조회하면 성능 저하
- 복잡도 대비 보안 이득 적음

---

## 4. 구현 범위

1. **Redis 설정** - build.gradle, application.yml, RedisConfig
2. **RefreshToken 엔티티** - Redis용 (또는 문자열 저장)
3. **JwtTokenProvider 수정** - Refresh Token 생성 추가
4. **AuthService 수정** - login에서 RT 저장, refresh 메서드, logout에서 RT 삭제
5. **AuthController 수정** - /refresh 엔드포인트
6. **LoginResponse 수정** - refreshToken 필드 추가

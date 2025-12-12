# JWT 핵심 개념: HMAC과 Claims

## 질문
> `hmacShaKeyFor`은 무엇인가요? 또한 `claims`는 무엇인가요?

---

## 1. hmacShaKeyFor란?

### HMAC-SHA 알고리즘

```
HMAC = Hash-based Message Authentication Code (해시 기반 메시지 인증 코드)
SHA = Secure Hash Algorithm (안전한 해시 알고리즘)
```

**JWT 서명(Signature)에 사용되는 암호화 알고리즘**입니다.

### 코드 동작

```java
// 1. 문자열 키를 Base64로 인코딩
String encodedKey = Base64.getEncoder().encodeToString(envKey.getBytes());
// "my-secret-key" → "bXktc2VjcmV0LWtleQ=="

// 2. 인코딩된 키로 SecretKey 객체 생성
key = Keys.hmacShaKeyFor(encodedKey.getBytes());
// → HMAC-SHA256/384/512 알고리즘에 사용할 수 있는 키 생성
```

### 왜 필요한가?

JWT는 3개 부분으로 구성됩니다:

```
JWT = Header.Payload.Signature
                     ↑
              이 부분을 만들 때 SecretKey 사용
```

서명 생성 과정:
```
Signature = HMAC-SHA256(
    base64(Header) + "." + base64(Payload),
    SecretKey  ← hmacShaKeyFor로 만든 키
)
```

### 서명의 역할

```
[토큰 발급 시]
서버: Header + Payload + SecretKey → Signature 생성

[토큰 검증 시]
서버: Header + Payload + SecretKey → Signature 재생성
      → 받은 Signature와 비교
      → 다르면 위변조된 토큰!
```

**서명이 있어야 토큰 위변조를 감지할 수 있습니다.**

---

## 2. Claims란?

### JWT 구조

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvbSJ9.xxxxx
       ↑                              ↑                                    ↑
    Header                        Payload (Claims)                     Signature
```

### Claims = Payload 안의 데이터

Payload를 Base64 디코딩하면 JSON이 나옵니다:

```json
{
  "sub": "1",                    // subject (사용자 ID)
  "email": "test@email.com",     // 커스텀 claim
  "subscriptionType": "FREE",    // 커스텀 claim
  "iat": 1702368000,             // issued at (발급 시간)
  "exp": 1702371600              // expiration (만료 시간)
}
```

### Claims 종류

| 종류 | 설명 | 예시 |
|------|------|------|
| **Registered Claims** | JWT 표준에 정의된 것 | `sub`, `iat`, `exp`, `iss`, `aud` |
| **Custom Claims** | 우리가 직접 추가한 것 | `email`, `subscriptionType`, `role` |

### Registered Claims (표준 클레임)

| Claim | 이름 | 설명 |
|-------|------|------|
| `sub` | Subject | 토큰 주체 (보통 사용자 ID) |
| `iat` | Issued At | 토큰 발급 시간 |
| `exp` | Expiration | 토큰 만료 시간 |
| `iss` | Issuer | 토큰 발급자 |
| `aud` | Audience | 토큰 대상자 |
| `nbf` | Not Before | 토큰 활성 시작 시간 |
| `jti` | JWT ID | 토큰 고유 식별자 |

### 우리 프로젝트에서 사용하는 Claims

```java
// JwtTokenProvider.java

// Claims 설정 (토큰 생성 시)
Jwts.builder()
    .subject(String.valueOf(userId))          // sub: 사용자 ID
    .claim("email", email)                    // 커스텀: 이메일
    .claim("subscriptionType", subscriptionType)  // 커스텀: 구독 타입
    .issuedAt(now)                            // iat: 발급 시간
    .expiration(validity)                     // exp: 만료 시간
    .signWith(key)                            // 서명
    .compact();

// Claims 추출 (토큰 검증 시)
Claims claims = getClaims(token);
String userId = claims.getSubject();                      // "1"
String email = claims.get("email", String.class);         // "test@email.com"
String type = claims.get("subscriptionType", String.class); // "FREE"
```

---

## 3. JWT 전체 흐름

```
[로그인 시 - 토큰 생성]

1. 사용자 정보 준비
   userId: 1, email: "test@email.com", subscriptionType: FREE

2. Header 생성
   { "alg": "HS256", "typ": "JWT" }

3. Payload (Claims) 생성
   { "sub": "1", "email": "test@email.com", "subscriptionType": "FREE", "exp": ... }

4. Signature 생성
   HMAC-SHA256(Header + Payload, SecretKey)

5. 토큰 완성
   Header.Payload.Signature (Base64 인코딩)


[API 요청 시 - 토큰 검증]

1. Authorization 헤더에서 토큰 추출
   "Bearer eyJhbGciOiJIUzI1NiJ9..." → 토큰만 추출

2. 서명 검증
   SecretKey로 Signature 재생성 → 일치하는지 확인

3. 만료 시간 확인
   exp claim이 현재 시간보다 이후인지 확인

4. Claims 추출
   사용자 ID, 이메일, 구독 타입 등

5. 인증 완료
   SecurityContext에 사용자 정보 저장
```

---

## 4. 보안 주의사항

### SecretKey 관리

```yaml
# application.yml - 환경 변수로 관리
jwt:
  secret: ${JWT_SECRET:default-key-for-dev-only}
```

- 운영 환경에서는 반드시 환경 변수로 주입
- 최소 256비트 (32자) 이상 권장
- 절대 코드에 하드코딩 금지

### Claims에 민감 정보 넣지 않기

```java
// ❌ 잘못된 예
.claim("password", password)
.claim("creditCard", cardNumber)

// ✅ 올바른 예
.claim("userId", userId)
.claim("role", role)
```

JWT Payload는 Base64 디코딩만 하면 누구나 볼 수 있습니다!

---

## 5. 요약

| 개념 | 설명 |
|------|------|
| `hmacShaKeyFor` | JWT 서명용 비밀 키 생성 메서드 |
| `HMAC-SHA` | 해시 기반 메시지 인증 코드 알고리즘 |
| `Claims` | JWT Payload 안의 데이터 (사용자 정보 등) |
| `Registered Claims` | 표준 클레임 (sub, exp, iat 등) |
| `Custom Claims` | 직접 추가한 클레임 (email, role 등) |

---

## 관련 파일
- `global/security/jwt/JwtTokenProvider.java`

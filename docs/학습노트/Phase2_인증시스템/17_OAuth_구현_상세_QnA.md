# OAuth 구현 상세 Q&A

## 이 문서는?
Google OAuth 구현 시 발생한 세부 질문들을 모은 문서입니다.
전체 OAuth 흐름은 `12_Google_OAuth_연동_개념.md`를 참고하세요.

---

## Q1. 공식 문서는 어디서 찾나요?

### 공식 문서 위치

**1. OAuth 2.0 전체 흐름 가이드**
```
https://developers.google.com/identity/protocols/oauth2
```

**2. 웹 서버 애플리케이션용 OAuth 2.0 (가장 중요)**
```
https://developers.google.com/identity/protocols/oauth2/web-server
```

**3. UserInfo API**
```
https://developers.google.com/identity/openid-connect/openid-connect
```

### 검색 팁
```
"google oauth2 token endpoint" site:developers.google.com
```
`site:developers.google.com`을 붙이면 공식 문서만 검색됩니다.

---

## Q2. scope와 state는 언제 필요한가요?

### 단계별 필요 여부

```
┌─────────────────────────────────────────────────────────────┐
│  1단계: Authorization URL (프론트엔드 → 구글 로그인 페이지)   │
│  - scope: ✅ 필수                                           │
│  - state: ✅ 권장 (CSRF 방지)                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2단계: Token 교환 (백엔드 → 구글 Token API)                 │
│  - scope: ❌ 불필요                                         │
│  - state: ❌ 불필요                                         │
└─────────────────────────────────────────────────────────────┘
```

| 파라미터 | 1단계 (Authorization) | 2단계 (Token 교환) |
|----------|----------------------|-------------------|
| scope | ✅ 필수 | ❌ 불필요 |
| state | ✅ 권장 | ❌ 불필요 |

### state 파라미터란?
CSRF 공격 방지용:
1. 프론트엔드: 랜덤 state 생성 → 세션에 저장 → 구글에 전송
2. 구글: 콜백 URL에 그대로 포함하여 반환
3. 프론트엔드: 세션의 state와 비교 → 불일치면 요청 거부

---

## Q3. 콜백을 프론트엔드로 받을까, 백엔드로 받을까?

### 방식 비교

| 방식 | Redirect URI | 흐름 |
|------|--------------|------|
| **A. 프론트엔드 콜백** | `localhost:5173/oauth/callback` | 구글 → 프론트 → 백엔드 |
| **B. 백엔드 콜백** | `localhost:8080/api/oauth/callback` | 구글 → 백엔드 → 프론트 |

### 방식 A: 프론트엔드 콜백 (현재 설정)
```
구글 → 프론트엔드 콜백 (code 받음)
         ↓
프론트엔드가 POST /api/v1/oauth/google 호출
         ↓
백엔드가 JSON Body로 JWT 응답  ✅
```

### 방식 B: 백엔드 콜백
```
구글 → 백엔드 콜백 (code 받음)
         ↓
백엔드가 리다이렉트 (JWT는 쿼리/쿠키로만 전달 가능)
```

### 선택 기준

| 기준 | 방식 A (프론트 콜백) | 방식 B (백엔드 콜백) |
|------|---------------------|---------------------|
| JWT 전달 | Body로 가능 ✅ | 쿼리/쿠키만 가능 |
| 구현 복잡도 | 프론트가 약간 복잡 | 백엔드가 약간 복잡 |
| 일반적 선택 | ✅ SPA에서 많이 사용 | SSR/전통 웹에서 사용 |

---

## Q4. JWT를 Body로 전달하면 안 되나요?

### 리다이렉트의 특성
```
문제: 리다이렉트(302)는 Body를 가질 수 없음!
```

HTTP 리다이렉트 동작:
```
1. 서버: 302 응답 + Location 헤더만 전송
2. 브라우저: Location URL로 GET 요청 (자동)
3. Body? → 전달 불가능!
```

### 결론
- Body로 JWT 전달하려면 → **프론트엔드 콜백 방식** 사용
- 백엔드 콜백 방식에서는 → 쿼리 파라미터 또는 쿠키로만 전달 가능

---

---

## Q5. 소셜 로그인 사용자는 이메일 인증을 true로 해야 하나요?

### 결론: true로 설정

```java
User user = User.builder()
    .email(userInfo.getEmail())
    .provider(Provider.GOOGLE)
    .emailVerified(true)  // ✅ true
    .build();
```

### 이유

| 구분 | 이메일 인증 주체 | 신뢰 가능? |
|------|-----------------|-----------|
| 일반 회원가입 | 우리 서비스가 직접 인증 | 인증 전까지 ❌ |
| 구글 로그인 | **구글이 이미 인증함** | ✅ |
| 네이버 로그인 | **네이버가 이미 인증함** | ✅ |

구글 응답에서 `verified_email` 필드를 사용할 수도 있지만,
소셜 로그인 계정은 거의 100% 인증된 상태이므로 `true` 고정도 무방.

---

---

## Q6. 네이버 OAuth는 구글과 동일한가요?

### 전체 흐름은 동일
```
프론트엔드 → 네이버 로그인 → 콜백(code) → 백엔드 → 토큰 교환 → 사용자 정보
```

### 차이점

| 항목 | Google | Naver |
|------|--------|-------|
| **Token 요청** | POST Body | **GET Query Parameter** |
| **응답 구조** | 바로 데이터 | `response` 객체로 감싸져 있음 |
| **state** | 선택 | **필수** |

### 네이버 사용자 정보 응답 구조
```json
{
  "resultcode": "00",
  "message": "success",
  "response": {          // ← response 안에 데이터!
    "id": "123456789",
    "email": "user@naver.com",
    "name": "홍길동"
  }
}
```

### NaverOAuthClient - GET 방식 토큰 요청
```java
String url = UriComponentsBuilder.fromHttpUrl(tokenUri)
    .queryParam("grant_type", "authorization_code")
    .queryParam("client_id", clientId)
    .queryParam("code", code)
    .queryParam("state", state)
    .toUriString();

return restTemplate.getForObject(url, NaverTokenResponse.class);
```

---

## 관련 파일
- `infra/oauth/google/GoogleOAuthClient.java`
- `infra/oauth/naver/NaverOAuthClient.java`
- `domain/user/controller/OAuthController.java`
- `domain/user/service/OAuthService.java`
- `backend/src/main/resources/application.yml`

## 관련 링크
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)

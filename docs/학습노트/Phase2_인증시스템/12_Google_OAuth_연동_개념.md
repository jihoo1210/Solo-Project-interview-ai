# Google OAuth 연동 개념

## 질문
> Google OAuth 연동의 기본적인 설명이 필요해요

---

## 1. OAuth 2.0이란?

**OAuth** = Open Authorization (개방형 인가)

"다른 서비스의 인증을 빌려서 우리 서비스에 로그인"하는 방식입니다.

```
[기존 방식]
사용자 → 우리 서비스에 직접 회원가입 (이메일, 비밀번호 입력)

[OAuth 방식]
사용자 → "구글 로그인" 클릭 → 구글이 인증 → 우리 서비스에 자동 로그인
```

### 장점
- 사용자: 비밀번호 기억 필요 없음
- 개발자: 비밀번호 관리 부담 감소
- 보안: 구글의 강력한 보안 활용

---

## 2. OAuth 2.0 전체 흐름

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────┐
│  사용자  │     │  프론트엔드   │     │   백엔드     │     │  Google  │
└────┬────┘     └──────┬──────┘     └──────┬──────┘     └────┬────┘
     │                 │                   │                 │
     │ ① 구글 로그인 클릭 │                   │                 │
     │────────────────▶│                   │                 │
     │                 │                   │                 │
     │                 │ ② 구글 로그인 페이지로 리다이렉트          │
     │                 │──────────────────────────────────▶│
     │                 │                   │                 │
     │                 │  ③ 구글 로그인 (ID/PW 입력)            │
     │────────────────────────────────────────────────────▶│
     │                 │                   │                 │
     │                 │ ④ Authorization Code와 함께 콜백 URL로 리다이렉트
     │                 │◀──────────────────────────────────│
     │                 │                   │                 │
     │                 │ ⑤ Code를 백엔드로 전달                 │
     │                 │──────────────────▶│                 │
     │                 │                   │                 │
     │                 │                   │ ⑥ Code로 Access Token 요청
     │                 │                   │────────────────▶│
     │                 │                   │                 │
     │                 │                   │ ⑦ Access Token 응답
     │                 │                   │◀────────────────│
     │                 │                   │                 │
     │                 │                   │ ⑧ Token으로 사용자 정보 요청
     │                 │                   │────────────────▶│
     │                 │                   │                 │
     │                 │                   │ ⑨ 사용자 정보 응답 (email, name 등)
     │                 │                   │◀────────────────│
     │                 │                   │                 │
     │                 │ ⑩ JWT 토큰 발급    │                 │
     │                 │◀──────────────────│                 │
     │                 │                   │                 │
     │ ⑪ 로그인 완료    │                   │                 │
     │◀────────────────│                   │                 │
```

---

## 3. 핵심 용어 정리

| 용어 | 설명 | 예시 |
|------|------|------|
| **Client ID** | 우리 앱을 식별하는 공개 ID | `493322...` |
| **Client Secret** | 우리 앱만 아는 비밀 키 | `GOCSPX-...` (절대 노출 금지!) |
| **Authorization Code** | 구글이 발급하는 임시 코드 (1회용) | `4/0AX4XfW...` |
| **Access Token** | 구글 API 호출에 사용하는 토큰 | `ya29.a0AfH...` |
| **Redirect URI** | 인증 후 돌아올 URL | `http://localhost:5173/oauth/callback/google` |

---

## 4. 구현할 파일 설명

### 4.1 `GoogleOAuthClient.java`

**역할**: 구글 API와 통신하는 클라이언트

```java
// 구글에 요청하는 2가지 작업:
1. Authorization Code → Access Token 교환
2. Access Token → 사용자 정보 조회
```

**호출하는 구글 API**:
```
POST https://oauth2.googleapis.com/token     // 토큰 발급
GET  https://www.googleapis.com/oauth2/v2/userinfo  // 사용자 정보
```

### 4.2 `GoogleTokenResponse.java`

**역할**: 구글 토큰 API 응답을 담는 DTO

```json
// 구글 응답 예시
{
  "access_token": "ya29.a0AfH6SMC...",
  "expires_in": 3599,
  "token_type": "Bearer",
  "scope": "email profile",
  "id_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

### 4.3 `GoogleUserInfo.java`

**역할**: 구글 사용자 정보 API 응답을 담는 DTO

```json
// 구글 응답 예시
{
  "id": "123456789",
  "email": "user@gmail.com",
  "verified_email": true,
  "name": "홍길동",
  "given_name": "길동",
  "family_name": "홍",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

### 4.4 `OAuthLoginRequest.java`

**역할**: 프론트엔드에서 받는 요청 DTO

```json
// 프론트엔드 요청
{
  "code": "4/0AX4XfWi..."  // Authorization Code
}
```

### 4.5 `OAuthService.java`

**역할**: OAuth 로그인 비즈니스 로직

```java
public LoginResponse googleLogin(OAuthLoginRequest request) {
    // 1. Code → Access Token 교환
    GoogleTokenResponse tokenResponse = googleOAuthClient.getToken(request.getCode());

    // 2. Access Token → 사용자 정보 조회
    GoogleUserInfo userInfo = googleOAuthClient.getUserInfo(tokenResponse.getAccessToken());

    // 3. DB에서 사용자 조회 또는 신규 생성
    User user = findOrCreateUser(userInfo);

    // 4. JWT 발급
    String accessToken = jwtTokenProvider.createJWT(...);
    String refreshToken = jwtTokenProvider.createRefreshToken();

    return LoginResponse.of(user, accessToken, refreshToken);
}
```

### 4.6 `OAuthController.java`

**역할**: OAuth API 엔드포인트

```java
@PostMapping("/google")
public ApiResponse<LoginResponse> googleLogin(@RequestBody OAuthLoginRequest request) {
    return ApiResponse.success(oAuthService.googleLogin(request));
}
```

---

## 5. 프론트엔드 흐름

### 5.1 구글 로그인 버튼 클릭 시

```typescript
const handleGoogleLogin = () => {
  const clientId = "493322...";
  const redirectUri = "http://localhost:5173/oauth/callback/google";
  const scope = "email profile";

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${scope}`;

  window.location.href = googleAuthUrl;  // 구글 로그인 페이지로 이동
};
```

### 5.2 콜백 페이지 (리다이렉트 후)

```typescript
// URL: http://localhost:5173/oauth/callback/google?code=4/0AX4XfWi...

const OAuthCallback = () => {
  const code = new URLSearchParams(window.location.search).get('code');

  useEffect(() => {
    // 백엔드로 code 전달
    axios.post('/api/v1/oauth/google', { code })
      .then(response => {
        // JWT 저장 및 로그인 완료 처리
        localStorage.setItem('accessToken', response.data.data.accessToken);
        navigate('/dashboard');
      });
  }, []);
};
```

---

## 6. 보안 주의사항

### Client Secret은 백엔드에서만!

```
❌ 프론트엔드에 Client Secret 노출
✅ 백엔드에서만 Client Secret 사용
```

### Authorization Code는 1회용!

```
Code → Token 교환은 한 번만 가능
같은 Code로 다시 요청하면 에러
```

### HTTPS 필수 (운영 환경)

```
개발: http://localhost:5173 (허용)
운영: https://your-domain.com (필수)
```

---

## 7. 요약

| 단계 | 담당 | 설명 |
|------|------|------|
| ① 구글 로그인 페이지 이동 | 프론트엔드 | Client ID로 구글 URL 생성 |
| ② 사용자 인증 | 구글 | 사용자가 직접 로그인 |
| ③ Code 발급 | 구글 | 콜백 URL로 Code 전달 |
| ④ Code → Token 교환 | 백엔드 | Client Secret 사용 |
| ⑤ Token → 사용자 정보 | 백엔드 | 구글 API 호출 |
| ⑥ User 조회/생성 | 백엔드 | DB 작업 |
| ⑦ JWT 발급 | 백엔드 | 우리 서비스 토큰 |

---

## 관련 파일
- `infra/oauth/google/GoogleOAuthClient.java`
- `infra/oauth/google/dto/GoogleTokenResponse.java`
- `infra/oauth/google/dto/GoogleUserInfo.java`
- `domain/user/dto/OAuthLoginRequest.java`
- `domain/user/service/OAuthService.java`
- `domain/user/controller/OAuthController.java`

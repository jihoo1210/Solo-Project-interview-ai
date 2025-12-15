# OAuth 구현 트러블슈팅

> Phase 2 인증시스템 구현 중 발생한 오류와 해결 방법 정리

---

## 1. 프론트엔드 로딩 상태 무한 대기

### 증상
앱 시작 시 로딩 화면에서 벗어나지 못함

### 원인
Zustand store의 `isLoading` 초기값이 `true`인데, persist 복원 후 `false`로 변경하는 로직 부재

### 해결
```typescript
// authStore.ts
persist(
  (set) => ({ ... }),
  {
    name: 'auth-storage',
    partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    onRehydrateStorage: () => (state) => {
      if (state) {
        state.setLoading(false);  // persist 복원 완료 후 로딩 해제
      }
    },
  }
)
```

### 핵심 개념
- `onRehydrateStorage`: Zustand persist가 localStorage에서 상태 복원을 완료한 후 호출되는 콜백

---

## 2. Google OAuth `invalid_client`

### 증상
Google 로그인 시 `invalid_client` 오류

### 원인
`.env` 파일에 placeholder 값 사용

### 해결
실제 Google Cloud Console에서 발급받은 Client ID/Secret 입력

---

## 3. Google OAuth `redirect_uri_mismatch`

### 증상
```
400 오류: redirect_uri_mismatch
```

### 원인
백엔드(`/oauth/callback/google`)와 프론트엔드(`/oauth/google/callback`) 경로 불일치

### 해결
프론트엔드 라우트를 백엔드 설정에 맞춤:
```typescript
// App.tsx
<Route path="/oauth/callback/google" element={<GoogleCallbackPage />} />
<Route path="/oauth/callback/naver" element={<NaverCallbackPage />} />
```

### 체크리스트
1. Google Cloud Console의 승인된 리디렉션 URI
2. 백엔드 `application.yml`의 `redirect-uri`
3. 프론트엔드 라우트 경로
4. 프론트엔드 OAuth 버튼의 redirect_uri

**4곳 모두 동일해야 함!**

---

## 4. Google OAuth 400 Bad Request (Invalid JSON payload)

### 증상
```
Invalid JSON payload received. Unexpected token
```

### 원인
Google 토큰 엔드포인트에 `Content-Type: application/json`으로 요청

### 해결
OAuth 토큰 교환은 반드시 `application/x-www-form-urlencoded` 사용:
```java
// GoogleOAuthClient.java
HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);  // 필수!

MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
params.add("code", code);
params.add("client_id", clientId);
// ...
```

### 핵심 개념
OAuth 2.0 표준(RFC 6749)에서 토큰 요청은 `application/x-www-form-urlencoded`로 명시됨

---

## 5. Naver OAuth 동일 오류

### 증상
Naver 토큰 요청 실패

### 원인
Content-Type 헤더 누락

### 해결
```java
// NaverOAuthClient.java
HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
```

---

## 6. OAuth 401 Unauthorized

### 증상
```
HttpClientErrorException$Unauthorized: 401 Unauthorized
```

### 원인
1. `.env` 파일 오타: `NAVER_CLINET_SECRET` → `NAVER_CLIENT_SECRET`
2. `spring-dotenv`가 `.env` 파일을 못 읽음

### 해결
1. 오타 수정
2. `.env` 파일을 `src/main/resources/`에도 복사

### 디버깅 팁
OAuth 클라이언트에 디버그 로그 추가:
```java
log.info("OAuth - clientId: {}", properties.getClientId());
log.info("OAuth - clientSecret exists: {}",
    properties.getClientSecret() != null && !properties.getClientSecret().contains("your-"));
```

---

## 7. 불필요한 스택트레이스 로그

### 증상
콘솔에 Spring 프레임워크 스택트레이스가 너무 많이 출력

### 해결
```yaml
# application.yml
logging:
  level:
    root: WARN
    "[com.interviewai]": INFO
```

GlobalExceptionHandler에서 앱 코드만 스택트레이스 출력:
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<?> handleException(Exception e) {
    log.error("UnhandledException: {} - {}", e.getClass().getSimpleName(), e.getMessage());
    for (StackTraceElement element : e.getStackTrace()) {
        if (element.getClassName().startsWith("com.interviewai")) {
            log.error("  at {}.{}({}:{})",
                element.getClassName(), element.getMethodName(),
                element.getFileName(), element.getLineNumber());
        }
    }
    // ...
}
```

---

## 8. Filter 예외가 계속 스택트레이스 출력

### 증상
`JwtAuthenticationFilter`에서 발생한 예외가 여전히 스택트레이스 출력

### 원인
Filter 예외는 `@RestControllerAdvice`가 처리 못함 (DispatcherServlet 이전 단계)

### 해결
Filter에서 직접 try-catch:
```java
@Override
protected void doFilterInternal(...) {
    try {
        // JWT 인증 로직
    } catch (Exception e) {
        log.debug("JWT 인증 실패: {}", e.getMessage());  // 조용히 처리
    }
    filterChain.doFilter(request, response);  // 반드시 호출
}
```

### 핵심 개념
→ [20_Spring_예외처리_필터vs컨트롤러.md](./20_Spring_예외처리_필터vs컨트롤러.md) 참조

---

## 9. 로그인 성공 후 login 페이지로 리다이렉트

### 증상
OAuth 로그인 성공했는데 `/login`으로 다시 이동

### 원인
백엔드 `LoginResponse`와 프론트엔드 기대 구조 불일치

**백엔드 (기존):**
```java
public class LoginResponse {
    String email;
    String nickname;
    String accessToken;
    String refreshToken;
}
```

**프론트엔드 기대:**
```typescript
interface LoginResponse {
  user: User;  // <- 백엔드에 없음!
  accessToken: string;
  refreshToken: string;
}
```

### 해결
백엔드 응답 구조를 프론트엔드에 맞춤:
```java
@Builder
@Value
public class LoginResponse {
    UserInfo user;
    String accessToken;
    String refreshToken;

    @Builder(builderMethodName = "userInfoBuilder")
    @Value
    public static class UserInfo {
        Long id;
        String email;
        String nickname;
        // ...
    }
}
```

---

## 10. Lombok `@Builder` 충돌

### 증상
외부 클래스와 내부 클래스 둘 다 `@Builder` 사용 시 IDE 오류

### 원인
동일한 `builder()` 메서드명 충돌

### 해결
내부 클래스의 빌더 이름 변경:
```java
@Builder(builderMethodName = "userInfoBuilder")
public static class UserInfo { ... }

// 사용
UserInfo.userInfoBuilder().id(1L).build();
```

---

## 11. 네이버 로그인 시 "보안 검증 실패" 메시지 깜빡임

### 증상
네이버 로그인 버튼 클릭 후 콜백 페이지에서 잠깐 "보안 검증에 실패했습니다" 메시지가 보임

### 원인
`sessionStorage.getItem()` 결과를 렌더링 단계에서 바로 검증하여 `state !== savedState` 조건이 일시적으로 `true`

### 해결
state 검증을 `useEffect` 안으로 이동, 초기 렌더링은 항상 로딩 화면 표시:
```typescript
export default function NaverCallbackPage() {
  const processedRef = useRef(false);

  // URL 파라미터 에러만 즉시 체크
  const immediateError = errorParam ? '취소되었습니다.' : !code ? '인증 정보 없음' : null;

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    // state 검증은 여기서
    const savedState = sessionStorage.getItem('naver_oauth_state');
    if (state !== savedState) {
      navigate('/login');
      return;
    }
    // ...
  }, []);

  // 항상 로딩 화면 먼저 표시
  return <LoadingSpinner />;
}
```

---

## 12. 프론트엔드 OAuth Redirect URI 불일치

### 증상
OAuth 콜백이 404 또는 잘못된 페이지로 이동

### 원인
`OAuthButtons.tsx`의 기본 redirect URI가 라우트 경로와 다름

### 해결
```typescript
// OAuthButtons.tsx
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI
  || 'http://localhost:5173/oauth/callback/google';  // 라우트와 일치
const NAVER_REDIRECT_URI = import.meta.env.VITE_NAVER_REDIRECT_URI
  || 'http://localhost:5173/oauth/callback/naver';   // 라우트와 일치
```

---

## 요약: OAuth 구현 체크리스트

### 백엔드
- [ ] `.env` 파일에 실제 Client ID/Secret 설정
- [ ] `.env` 파일을 `src/main/resources/`에도 복사 (spring-dotenv)
- [ ] OAuth 토큰 요청 시 `Content-Type: application/x-www-form-urlencoded`
- [ ] `redirect-uri` 설정 확인
- [ ] `LoginResponse` 구조가 프론트엔드와 일치

### 프론트엔드
- [ ] `.env` 파일에 Client ID 설정
- [ ] OAuth 버튼의 redirect_uri가 라우트와 일치
- [ ] 콜백 페이지 라우트 설정
- [ ] Zustand persist `onRehydrateStorage` 설정

### OAuth Provider (Google/Naver 콘솔)
- [ ] 승인된 리디렉션 URI 등록
- [ ] 필요한 scope 설정

---

## 관련 키워드
- OAuth 2.0 Authorization Code Grant
- spring-dotenv
- Zustand persist
- Content-Type application/x-www-form-urlencoded
- Spring Filter Exception Handling
- React useEffect vs 렌더링 단계


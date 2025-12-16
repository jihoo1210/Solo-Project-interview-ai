# [Phase 2] 인증 시스템 구현서 v1.0

> 작성일: 2024-12-12
> 버전: 2.0 (Task 1~16 완료)
> 작성자: AI Interview Simulator Team

---

## 1. 개요

Phase 2에서는 AI 기술 면접 시뮬레이터의 인증 시스템을 구현합니다. 본 문서는 백엔드 API와 프론트엔드 UI 구현 내용을 다룹니다.

### 1.1 완료된 Task

| Task | 내용 | 상태 |
|------|------|------|
| Task 1 | User, EmailVerification 엔티티 및 Repository | ✅ 완료 |
| Task 2 | Spring Security + JWT 설정 (Access Token) | ✅ 완료 |
| Task 3 | 회원가입 API | ✅ 완료 |
| Task 4 | 이메일 발송 서비스 | ✅ 완료 |
| Task 5 | 이메일 인증 API | ✅ 완료 |
| Task 6 | 로그인/로그아웃 API | ✅ 완료 |
| Task 7 | 토큰 갱신 API (Refresh Token) | ✅ 완료 |
| Task 8 | Google OAuth 연동 | ✅ 완료 |
| Task 9 | Naver OAuth 연동 | ✅ 완료 |
| Task 10 | 회원가입 페이지 | ✅ 완료 |
| Task 11 | 로그인 페이지 | ✅ 완료 |
| Task 12 | 이메일 인증 페이지 | ✅ 완료 |
| Task 13 | OAuth 로그인 버튼 | ✅ 완료 |
| Task 14 | OAuth 콜백 처리 | ✅ 완료 |
| Task 15 | 인증 상태 관리 | ✅ 완료 |
| Task 16 | 보호된 라우트 | ✅ 완료 |

---

## 2. 생성된 파일 목록

### 2.1 Task 1: 엔티티 및 Repository

| 파일 경로 | 설명 |
|----------|------|
| `domain/user/entity/User.java` | 사용자 엔티티 |
| `domain/user/entity/AuthProvider.java` | 인증 제공자 Enum (LOCAL, GOOGLE, NAVER) |
| `domain/user/entity/SubscriptionType.java` | 구독 타입 Enum (FREE, PREMIUM) |
| `domain/user/entity/EmailVerification.java` | 이메일 인증 토큰 엔티티 |
| `domain/user/repository/UserRepository.java` | User Repository |
| `domain/user/repository/EmailVerificationRepository.java` | EmailVerification Repository |

### 2.2 Task 2: Spring Security + JWT

| 파일 경로 | 설명 |
|----------|------|
| `global/security/jwt/JwtTokenProvider.java` | JWT 토큰 생성/검증 |
| `global/security/jwt/JwtAuthenticationFilter.java` | JWT 인증 필터 |
| `global/security/UserDetailsServiceImpl.java` | Spring Security UserDetailsService 구현 |
| `global/security/UserPrincipal.java` | 인증된 사용자 정보 (UserDetails 구현) |
| `global/config/SecurityConfig.java` | Spring Security 설정 (수정) |
| `application.yml` | JWT 설정 추가 (수정) |

### 2.3 Task 3: 회원가입 API

| 파일 경로 | 설명 |
|----------|------|
| `domain/user/dto/SignupRequest.java` | 회원가입 요청 DTO |
| `domain/user/dto/SignupResponse.java` | 회원가입 응답 DTO |
| `domain/user/dto/UserResponse.java` | 사용자 정보 응답 DTO |
| `domain/user/service/AuthService.java` | 인증 서비스 |
| `domain/user/controller/AuthController.java` | 인증 컨트롤러 |

### 2.4 Task 4: 이메일 발송 서비스

| 파일 경로 | 설명 |
|----------|------|
| `infra/mail/EmailService.java` | 이메일 발송 서비스 |

### 2.5 Task 5: 이메일 인증 API

| 파일 경로 | 설명 |
|----------|------|
| `domain/user/dto/ResendVerificationRequest.java` | 인증 메일 재발송 요청 DTO |

### 2.6 Task 6: 로그인/로그아웃 API

| 파일 경로 | 설명 |
|----------|------|
| `domain/user/dto/LoginRequest.java` | 로그인 요청 DTO |
| `domain/user/dto/LoginResponse.java` | 로그인 응답 DTO (accessToken, refreshToken, email, nickname) |
| `domain/user/service/AuthService.java` | `login()` 메서드 추가 (수정) |
| `domain/user/controller/AuthController.java` | `/login`, `/logout` 엔드포인트 추가 (수정) |

### 2.7 Task 7: 토큰 갱신 API (Refresh Token)

| 파일 경로 | 설명 |
|----------|------|
| `global/config/RedisConfig.java` | Redis 연결 및 RedisTemplate 설정 |
| `infra/redis/RefreshTokenRepository.java` | Refresh Token 저장/조회/삭제 |
| `domain/user/dto/TokenRefreshRequest.java` | 토큰 갱신 요청 DTO |
| `domain/user/dto/TokenRefreshResponse.java` | 토큰 갱신 응답 DTO |
| `global/security/jwt/JwtTokenProvider.java` | `createRefreshToken()` 메서드 추가 (수정) |
| `domain/user/dto/LoginResponse.java` | `refreshToken` 필드 추가 (수정) |
| `domain/user/service/AuthService.java` | `refresh()`, `logout()` 메서드 추가 (수정) |
| `domain/user/controller/AuthController.java` | `/refresh` 엔드포인트 추가 (수정) |

---

## 3. 주요 코드 설명

### 3.1 User 엔티티

```java
// 위치: domain/user/entity/User.java

@Entity
@Table(name = "users")
public class User extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String email;

    @Column(length = 255)
    private String password;

    @Column(length = 50)
    private String nickname;

    @Column(name = "email_verified")
    private boolean emailVerified;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;  // LOCAL, GOOGLE, NAVER

    @Enumerated(EnumType.STRING)
    private SubscriptionType subscriptionType;  // FREE, PREMIUM

    // 비즈니스 메서드
    public void verifyEmail() {
        this.emailVerified = true;
        this.emailVerifiedAt = LocalDateTime.now();
    }
}
```

**설명**:
- `@Table(name = "users")`: 실제 DB 테이블명 지정 (user는 예약어)
- `@Enumerated(EnumType.STRING)`: Enum을 문자열로 저장 (가독성 + 안정성)
- `verifyEmail()`: 이메일 인증 완료 처리 메서드

---

### 3.2 AuthService (회원가입)

```java
// 위치: domain/user/service/AuthService.java

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class AuthService {

    @Transactional(readOnly = false)
    public SignupResponse signup(SignupRequest request) {
        // 1. 이메일 중복 검사
        if(emailDuplicateCheck(email)) throw new CustomException(ErrorCode.DUPLICATE_EMAIL);

        // 2. 비밀번호 암호화
        String encodedPassword = encodePassword(password);

        // 3. User 저장
        SignupResponse response = createAndSaveUser(email, encodedPassword, nickname);

        // 4. 토큰 생성
        String token = emailService.generateVerificationEmailToken();

        // 5. 인증 이메일 발송
        emailService.sendVerificationEmail(email, token);

        // 6. 응답 반환
        return response;
    }
}
```

**설명**:
- `@Transactional(readOnly = true)`: 클래스 레벨 읽기 전용
- `@Transactional(readOnly = false)`: 쓰기 메서드에서 오버라이드
- 회원가입 시 자동으로 인증 이메일 발송

---

### 3.3 이메일 인증 검증

```java
// 위치: domain/user/service/AuthService.java

@Transactional(readOnly = false)
public void verifyEmail(String token) {
    EmailVerification emailVerification = emailVerificationRepository
        .findByToken(token)
        .orElseThrow(() -> new CustomException(ErrorCode.INVALID_VERIFICATION_TOKEN));

    // 만료 또는 사용됨 확인
    if(LocalDateTime.now().isAfter(emailVerification.getExpiresAt())
        || emailVerification.isUsed()) {
        throw new CustomException(ErrorCode.TOKEN_EXPIRED);
    }

    emailVerification.getUser().verifyEmail();
    emailVerification.markAsUsed();
}
```

**설명**:
- `LocalDateTime.now().isAfter(expiresAt)`: 현재 시간이 만료 시간을 지났는지 확인
- `markAsUsed()`: 토큰 재사용 방지 (Soft Delete)

---

### 3.4 EmailService (이메일 발송)

```java
// 위치: infra/mail/EmailService.java

@RequiredArgsConstructor
@Service
public class EmailService {

    public void sendVerificationEmail(String email, String token) {
        // 1. 이메일 발송
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(message);
        messageHelper.setTo(email);
        messageHelper.setSubject("[INTERVIEW AI] 회원가입 이메일 인증");
        messageHelper.setText(getRegistrationEmailHtml(token), true);
        javaMailSender.send(message);

        // 2. EmailVerification 저장
        EmailVerification emailVerification = EmailVerification.builder()
            .user(user)
            .token(token)
            .expiresAt(LocalDateTime.now().plusMinutes(10))
            .build();
        emailVerificationRepository.save(emailVerification);
    }

    public String generateVerificationEmailToken() {
        StringBuilder values = new StringBuilder();
        do {
            values.delete(0, values.length());
            for(int i = 0; i < 6; i++) {
                int value = (int) (Math.random() * 10);
                values.append(value);
            }
        } while (emailVerificationRepository.existsByToken(values.toString()));
        return values.toString();
    }
}
```

**설명**:
- `MimeMessageHelper`: HTML 이메일 발송 지원
- 토큰 중복 검사 후 유니크한 6자리 토큰 생성
- 만료 시간: 10분

---

### 3.5 AuthController (API 엔드포인트)

```java
// 위치: domain/user/controller/AuthController.java

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/signup")
    public ApiResponse<SignupResponse> signup(@RequestBody @Valid SignupRequest request) {
        return ApiResponse.<SignupResponse>success(authService.signup(request));
    }

    @GetMapping("/verify-email")
    public ApiResponse<Void> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ApiResponse.success();
    }

    @PostMapping("/resend-verification")
    public ApiResponse<Void> resendVerification(@RequestBody @Valid ResendVerificationRequest request) {
        authService.resendVerificationEmail(request.getEmail());
        return ApiResponse.success();
    }
}
```

---

### 3.6 AuthService (로그인)

```java
// 위치: domain/user/service/AuthService.java

public LoginResponse login(LoginRequest request) {
    String email = request.getEmail();
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

    // 1. 비밀번호 일치 검사 (이메일 존재 여부 노출 방지)
    if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
    }

    // 2. 이메일 인증된 회원 검사
    if(!user.isEmailVerified()) {
        throw new CustomException(ErrorCode.EMAIL_NOT_VERIFIED);
    }

    // 3. 토큰 발급
    String token = jwtTokenProvider.createJWT(user.getId(), email, user.getSubscriptionType());

    return LoginResponse.of(user, token);
}
```

**설명**:
- 비밀번호 검사를 먼저 수행하여 이메일 존재 여부 노출 방지
- 이메일 미인증 사용자는 로그인 차단
- `LoginResponse.of()`: 정적 팩토리 메서드로 응답 생성

---

### 3.7 LoginResponse (정적 팩토리 메서드)

```java
// 위치: domain/user/dto/LoginResponse.java

@Builder
@Value
public class LoginResponse {
    String email;
    String nickname;
    String accessToken;

    public static LoginResponse of(User user, String accessToken) {
        return LoginResponse.builder()
            .email(user.getEmail())
            .nickname(user.getNickname())
            .accessToken(accessToken)
            .build();
    }
}
```

**설명**:
- `of()`: 여러 파라미터(User 객체 + String)를 조합하여 생성
- `from()` vs `of()`: 단일 객체 변환은 `from`, 여러 값 조합은 `of`

---

### 3.8 RedisConfig (Redis 설정)

```java
// 위치: global/config/RedisConfig.java

@Configuration
public class RedisConfig {

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory();
    }

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

**설명**:
- `LettuceConnectionFactory`: Redis 연결을 위한 Lettuce 클라이언트 사용
- `StringRedisSerializer`: Key/Value를 문자열로 직렬화 (가독성, 디버깅 용이)

---

### 3.9 RefreshTokenRepository (Redis 저장소)

```java
// 위치: infra/redis/RefreshTokenRepository.java

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
```

**설명**:
- Key: Refresh Token (UUID), Value: userId
- TTL 자동 설정으로 만료 시 자동 삭제
- RT를 Key로 사용하여 userId 없이도 조회 가능 (보안)

---

### 3.10 AuthService (토큰 갱신)

```java
// 위치: domain/user/service/AuthService.java

public TokenRefreshResponse refresh(TokenRefreshRequest request) {
    String userId = refreshTokenRepository.findByRefreshToken(request.getRefreshToken());
    if(userId == null) throw new CustomException(ErrorCode.INVALID_TOKEN);

    User user = userRepository.findById(Long.parseLong(userId))
        .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

    String accessToken = jwtTokenProvider.createJWT(user.getId(), user.getEmail(), user.getSubscriptionType());
    String refreshToken = jwtTokenProvider.createRefreshToken();

    // Rotation: 이전 RT 삭제 후 새 RT 저장
    refreshTokenRepository.deleteByRefreshToken(request.getRefreshToken());
    refreshTokenRepository.save(refreshToken, user.getId());

    return TokenRefreshResponse.of(accessToken, refreshToken);
}

public void logout(TokenRefreshRequest request) {
    if(!refreshTokenRepository.deleteByRefreshToken(request.getRefreshToken())) {
        throw new CustomException(ErrorCode.INVALID_TOKEN);
    }
}
```

**설명**:
- **Refresh Token Rotation**: 갱신 시 새 RT 발급 (탈취 대응)
- 로그아웃 시 Redis에서 RT 즉시 삭제 (AT는 짧은 만료로 처리)

---

## 4. API 명세

| Method | Endpoint | Request | Response | 설명 |
|--------|----------|---------|----------|------|
| POST | `/api/v1/auth/signup` | `SignupRequest` | `SignupResponse` | 회원가입 |
| GET | `/api/v1/auth/verify-email` | `?token=xxx` | - | 이메일 인증 |
| POST | `/api/v1/auth/resend-verification` | `ResendVerificationRequest` | - | 인증 메일 재발송 |
| POST | `/api/v1/auth/login` | `LoginRequest` | `LoginResponse` | 로그인 |
| POST | `/api/v1/auth/refresh` | `TokenRefreshRequest` | `TokenRefreshResponse` | 토큰 갱신 |
| POST | `/api/v1/auth/logout` | `TokenRefreshRequest` | - | 로그아웃 (RT 삭제) |

---

## 5. 에러 해결 과정 (학생 작성)

> 이 섹션은 학생이 직접 작성합니다.

### 5.1 [에러 제목]

**에러 메시지**:
```
(에러 메시지 붙여넣기)
```

**원인 분석**:
- (원인 설명)

**해결 방법**:
- (해결 과정 설명)

**배운 점**:
- (이 에러를 통해 배운 것)

---

## 6. 실행 방법

### 6.1 Backend 실행

```bash
cd backend
./gradlew bootRun
```

### 6.2 확인 방법

1. Swagger UI: http://localhost:8080/swagger-ui.html
2. H2 Console: http://localhost:8080/h2-console
   - JDBC URL: `jdbc:h2:mem:interviewai`
   - Username: `sa`
   - Password: (빈칸)

---

## 7. Task 8~9: OAuth 연동 (Backend)

### 7.1 생성된 파일 목록

| 파일 경로 | 설명 |
|----------|------|
| `infra/oauth/google/GoogleOAuthProperties.java` | Google OAuth 설정 바인딩 |
| `infra/oauth/google/GoogleOAuthClient.java` | Google API 호출 클라이언트 |
| `infra/oauth/google/dto/GoogleTokenResponse.java` | Google 토큰 응답 DTO |
| `infra/oauth/google/dto/GoogleUserInfo.java` | Google 사용자 정보 DTO |
| `infra/oauth/naver/NaverOAuthProperties.java` | Naver OAuth 설정 바인딩 |
| `infra/oauth/naver/NaverOAuthClient.java` | Naver API 호출 클라이언트 |
| `infra/oauth/naver/dto/NaverTokenResponse.java` | Naver 토큰 응답 DTO |
| `infra/oauth/naver/dto/NaverUserInfo.java` | Naver 사용자 정보 DTO (중첩 클래스) |
| `domain/user/service/OAuthService.java` | OAuth 비즈니스 로직 |
| `domain/user/controller/OAuthController.java` | OAuth API 엔드포인트 |
| `domain/user/dto/OAuthGoogleLoginRequest.java` | Google 로그인 요청 DTO |
| `domain/user/dto/OAuthNaverLoginRequest.java` | Naver 로그인 요청 DTO |

### 7.2 GoogleOAuthClient (토큰 교환 및 사용자 정보 조회)

```java
// 위치: infra/oauth/google/GoogleOAuthClient.java

@RequiredArgsConstructor
@Component
public class GoogleOAuthClient {

    private final GoogleOAuthProperties properties;
    private final RestTemplate restTemplate = new RestTemplate();

    public GoogleTokenResponse getToken(String code) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", properties.getClientId());
        params.add("client_secret", properties.getClientSecret());
        params.add("redirect_uri", properties.getRedirectUri());
        params.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        return restTemplate.postForObject(properties.getTokenUri(), request, GoogleTokenResponse.class);
    }

    public GoogleUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
            properties.getUserInfoUri(),
            HttpMethod.GET,
            request,
            GoogleUserInfo.class
        );
        return response.getBody();
    }
}
```

**설명**:
- `@ConfigurationProperties`로 설정 바인딩 (prefix: `oauth2.google`)
- `RestTemplate`으로 Google API 호출
- 토큰 교환: POST + form-urlencoded
- 사용자 정보: GET + Bearer 토큰

### 7.3 NaverUserInfo (중첩 응답 구조)

```java
// 위치: infra/oauth/naver/dto/NaverUserInfo.java

@Getter
@NoArgsConstructor
public class NaverUserInfo {
    String resultcode;
    String message;
    NaverResponse response;  // 실제 사용자 정보는 여기에

    @Getter
    @NoArgsConstructor
    public static class NaverResponse {
        String id;
        String nickname;
        String name;
        String email;
        @JsonProperty("profile_image")
        String profileImage;
    }
}
```

**설명**:
- Naver API는 응답을 `response` 객체로 래핑하여 반환
- 중첩 클래스로 구조화

### 7.4 OAuthService (OAuth 로그인 처리)

```java
// 위치: domain/user/service/OAuthService.java

public LoginResponse googleLogin(String code) {
    // 1. 토큰 발급
    GoogleTokenResponse tokenResponse = googleOAuthClient.getToken(code);

    // 2. 사용자 정보 조회
    GoogleUserInfo userInfo = googleOAuthClient.getUserInfo(tokenResponse.getAccessToken());

    // 3. 회원 조회 또는 생성
    User user = userRepository.findByEmail(userInfo.getEmail())
        .orElseGet(() -> createGoogleUser(userInfo));

    // 4. JWT 발급
    String accessToken = jwtTokenProvider.createJWT(user.getId(), user.getEmail(), user.getSubscriptionType());
    String refreshToken = jwtTokenProvider.createRefreshToken();

    // 5. RT 저장
    refreshTokenRepository.save(refreshToken, user.getId());

    return LoginResponse.of(user, accessToken, refreshToken);
}

private User createGoogleUser(GoogleUserInfo userInfo) {
    return userRepository.save(User.builder()
        .email(userInfo.getEmail())
        .nickname(userInfo.getName())
        .profileImage(userInfo.getPicture())
        .provider(AuthProvider.GOOGLE)
        .subscriptionType(SubscriptionType.FREE)
        .emailVerified(true)  // 소셜 로그인은 자동 인증
        .build());
}
```

**설명**:
- OAuth 사용자는 `emailVerified = true`로 자동 인증 처리
- 기존 회원이면 조회, 없으면 자동 생성

### 7.5 OAuth API 엔드포인트

| Method | Endpoint | Request | Response | 설명 |
|--------|----------|---------|----------|------|
| POST | `/api/v1/oauth/google` | `OAuthGoogleLoginRequest` | `LoginResponse` | Google 로그인 |
| POST | `/api/v1/oauth/naver` | `OAuthNaverLoginRequest` | `LoginResponse` | Naver 로그인 |

---

## 8. Task 10~16: 프론트엔드 UI

### 8.1 생성된 파일 목록

| 파일 경로 | 설명 |
|----------|------|
| `src/api/auth.ts` | Auth API 함수들 |
| `src/hooks/useAuth.ts` | 인증 커스텀 훅 |
| `src/pages/auth/SignupPage.tsx` | 회원가입 페이지 |
| `src/pages/auth/LoginPage.tsx` | 로그인 페이지 |
| `src/pages/auth/EmailVerifyPage.tsx` | 이메일 인증 페이지 |
| `src/pages/auth/GoogleCallbackPage.tsx` | Google OAuth 콜백 |
| `src/pages/auth/NaverCallbackPage.tsx` | Naver OAuth 콜백 |
| `src/pages/HomePage.tsx` | 홈 페이지 (보호됨) |
| `src/components/auth/OAuthButtons.tsx` | OAuth 로그인 버튼 |
| `src/components/auth/PrivateRoute.tsx` | 인증 보호 라우트 |

### 8.2 라우팅 구조

| 경로 | 페이지 | 접근 권한 |
|------|--------|-----------|
| `/login` | 로그인 | Public (로그인시 홈으로) |
| `/signup` | 회원가입 | Public |
| `/verify-email` | 이메일 인증 | Public |
| `/oauth/google/callback` | Google 콜백 | Public |
| `/oauth/naver/callback` | Naver 콜백 | Public |
| `/` | 홈 | Private (인증 필요) |

### 8.3 useAuth 커스텀 훅

```typescript
// 위치: src/hooks/useAuth.ts

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: clearAuth } = useAuthStore();

  const handleAuthSuccess = useCallback(
    (response: LoginResponse) => {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);
    },
    [setUser]
  );

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      handleAuthSuccess(response);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate, setLoading, handleAuthSuccess]);

  // signup, logout, googleLogin, naverLogin 등...
}
```

**설명**:
- `useCallback`으로 함수 메모이제이션
- 의존성 배열에 사용하는 모든 값 포함 (exhaustive-deps)

### 8.4 OAuth 콜백 처리 패턴

```typescript
// 위치: src/pages/auth/GoogleCallbackPage.tsx

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  // 값을 렌더링 단계에서 추출 (primitive 값)
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  // URL 파라미터에서 바로 감지 가능한 에러는 렌더링 단계에서 계산
  const immediateError = errorParam
    ? 'Google 로그인이 취소되었습니다.'
    : !code
      ? '인증 코드가 없습니다.'
      : null;

  useEffect(() => {
    if (immediateError) {
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // useRef로 중복 실행 방지
    if (processedRef.current || !code) return;
    processedRef.current = true;

    const processLogin = async () => {
      try {
        await googleLogin(code);
      } catch (err) {
        setError(err.message);
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    processLogin();
  }, [code, immediateError, googleLogin, navigate]);

  const displayError = immediateError || error;
  // ...
}
```

**핵심 패턴**:
- `useSearchParams()`는 매 렌더링마다 새 객체 반환 (참조 불안정)
- 의존성에 `searchParams` 대신 추출한 primitive 값 사용
- `immediateError`로 동기적 에러를 렌더링 단계에서 처리
- `useRef`로 Strict Mode 중복 실행 방지

### 8.5 PrivateRoute (보호된 라우트)

```typescript
// 위치: src/components/auth/PrivateRoute.tsx

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

### 8.6 환경변수 (.env)

```
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/google/callback
VITE_NAVER_CLIENT_ID=your-naver-client-id
VITE_NAVER_REDIRECT_URI=http://localhost:5173/oauth/naver/callback
```

---

## 9. 진행 상황 평가

### Phase 2 완성도: **100%**

#### Backend (Task 1~9)

| 항목 | 상태 | 비고 |
|------|------|------|
| User 엔티티 | ✅ 완료 | verifyEmail() 메서드 추가 |
| EmailVerification 엔티티 | ✅ 완료 | markAsUsed() 메서드 추가 |
| AuthProvider Enum | ✅ 완료 | LOCAL, GOOGLE, NAVER |
| SubscriptionType Enum | ✅ 완료 | FREE, PREMIUM |
| UserRepository | ✅ 완료 | findByEmail, existsByEmail |
| EmailVerificationRepository | ✅ 완료 | existsByToken 추가 |
| JwtTokenProvider | ✅ 완료 | 생성/검증/추출 + createRefreshToken |
| JwtAuthenticationFilter | ✅ 완료 | OncePerRequestFilter |
| RedisConfig | ✅ 완료 | Redis 연결 및 RedisTemplate 설정 |
| RefreshTokenRepository | ✅ 완료 | RT 저장/조회/삭제 (Key: RT, Value: userId) |
| AuthService | ✅ 완료 | signup, verifyEmail, resendVerificationEmail, login, refresh, logout |
| AuthController | ✅ 완료 | 6개 엔드포인트 |
| EmailService | ✅ 완료 | 이메일 발송 + 토큰 생성 |
| GoogleOAuthClient | ✅ 완료 | RestTemplate, @ConfigurationProperties |
| NaverOAuthClient | ✅ 완료 | 중첩 응답 구조 처리 |
| OAuthService | ✅ 완료 | Google/Naver 로그인, 자동 회원가입 |
| OAuthController | ✅ 완료 | 2개 엔드포인트 |

#### Frontend (Task 10~16)

| 항목 | 상태 | 비고 |
|------|------|------|
| authStore (Zustand) | ✅ 완료 | persist 미들웨어 |
| apiClient (Axios) | ✅ 완료 | 인터셉터, 토큰 자동 갱신 |
| useAuth Hook | ✅ 완료 | useCallback, 의존성 배열 |
| SignupPage | ✅ 완료 | 폼 검증, 에러 처리 |
| LoginPage | ✅ 완료 | OAuth 버튼 포함 |
| EmailVerifyPage | ✅ 완료 | 토큰 검증 |
| GoogleCallbackPage | ✅ 완료 | useRef 중복 실행 방지 |
| NaverCallbackPage | ✅ 완료 | state CSRF 검증 |
| OAuthButtons | ✅ 완료 | Google/Naver 로그인 버튼 |
| PrivateRoute | ✅ 완료 | 인증 보호 라우트 |

### 잘한 점

**Backend:**
- `@Value` 불변 객체 DTO 사용
- 정적 팩토리 메서드 패턴 (from, of) 적절한 구분
- `@Transactional` 적절한 사용
- RT를 Key로 사용 (보안)
- Refresh Token Rotation 적용 (탈취 대응)
- `@ConfigurationProperties`로 OAuth 설정 바인딩
- Infrastructure 레이어 분리 (infra/oauth)

**Frontend:**
- `useCallback`으로 함수 메모이제이션
- `useSearchParams()` 참조 불안정 문제 해결
- `immediateError` 패턴으로 동기적 에러 처리
- `useRef`로 Strict Mode 중복 실행 방지
- Zustand persist로 인증 상태 유지

### 학습 포인트
- React `useCallback` 의존성 배열과 클로저
- `useSearchParams()` 참조 불안정성
- useEffect 내 동기적 setState 경고 해결
- OAuth Authorization Code Grant 흐름
- Google vs Naver OAuth 차이점 (state 필수 여부, 응답 구조)

---

> **Phase 2 인증 시스템 완료!**
> Phase 3 진행 준비가 되면 말씀해 주세요.

---

## 10. 추가 기능 (비밀번호 재설정 + 마이페이지)

### 10.1 비밀번호 재설정 기능 ✅ 완료

#### 생성/수정된 파일

| 파일 경로 | 설명 |
|----------|------|
| `domain/user/entity/PasswordResetToken.java` | 비밀번호 재설정 토큰 엔티티 |
| `domain/user/repository/PasswordResetTokenRepository.java` | 비밀번호 재설정 토큰 Repository |
| `domain/user/dto/PasswordResetRequest.java` | 비밀번호 재설정 요청 DTO (email) |
| `domain/user/dto/PasswordResetConfirmRequest.java` | 비밀번호 재설정 확인 DTO (token, newPassword) |
| `infra/mail/EmailType.java` | 이메일 타입 Enum (VERIFICATION, PASSWORD_RESET) |
| `infra/mail/EmailService.java` | EmailType 기반으로 리팩토링 (수정) |
| `domain/user/service/AuthService.java` | 비밀번호 재설정 메서드 추가 (수정) |
| `domain/user/controller/AuthController.java` | 비밀번호 재설정 엔드포인트 추가 (수정) |

#### API 엔드포인트

| Method | Endpoint | Request | Response | 설명 |
|--------|----------|---------|----------|------|
| POST | `/api/v1/auth/password-reset` | `PasswordResetRequest` | `Void` | 비밀번호 재설정 링크 요청 |
| POST | `/api/v1/auth/confirm-password-reset` | `PasswordResetConfirmRequest` | `LoginResponse` | 비밀번호 변경 + 자동 로그인 |
| POST | `/api/v1/auth/resend-password-reset` | `PasswordResetRequest` | `Void` | 재설정 이메일 재발송 |

#### EmailType Enum

```java
// 위치: infra/mail/EmailType.java

@Getter
@RequiredArgsConstructor
public enum EmailType {
    VERIFICATION(
        "[INTERVIEW AI] 회원가입 이메일 인증",
        "이메일 인증",
        "안녕하세요! AI 면접 시뮬레이터에 가입해 주셔서 감사합니다.<br>아래 버튼을 클릭하여 이메일 인증을 완료해 주세요.",
        "이메일 인증하기",
        "http://localhost:8080/api/v1/auth/verify-email?token="
    ),
    PASSWORD_RESET(
        "[INTERVIEW AI] 비밀번호 재설정",
        "비밀번호 재설정",
        "안녕하세요! AI 면접 시뮬레이터 비밀번호 재설정 링크입니다.<br>아래 버튼을 클릭하여 비밀번호를 재설정해 주세요.",
        "비밀번호 재설정하기",
        "http://localhost:5173/reset-password?token="
    );

    private final String subject;
    private final String title;
    private final String description;
    private final String buttonText;
    private final String linkPrefix;
}
```

**설명**:
- 이메일 종류별 설정을 Enum으로 중앙화
- 중복 코드 제거 및 유지보수성 향상

---

### 10.2 마이페이지 기능 🔲 진행 예정

#### 구현할 기능

| 기능 | HTTP Method | Endpoint | 인증 | 상태 |
|------|-------------|----------|------|------|
| 내 정보 조회 | GET | `/api/v1/users/me` | 필요 | 🔲 예정 |
| 닉네임 변경 | PATCH | `/api/v1/users/me/nickname` | 필요 | 🔲 예정 |
| 비밀번호 변경 | PATCH | `/api/v1/users/me/password` | 필요 (이메일 인증) | 🔲 예정 |
| 회원 탈퇴 | DELETE | `/api/v1/users/me` | 필요 (비밀번호 확인) | 🔲 예정 |
| 면접 통계 | GET | `/api/v1/users/me/stats` | 필요 | 🔲 Phase 3 이후 |

#### 설계 결정 사항

1. **비밀번호 변경**: 이메일 인증 필요
2. **회원 탈퇴**: Hard Delete + 비밀번호 재확인
3. **이메일 인증 캐싱**: Redis 기반 1시간 유효 세션

#### 이메일 인증 캐싱 설계

```
Key: verified_session:{userId}
Value: timestamp
TTL: 1시간
```

**흐름**:
1. 이메일 인증 성공 시 → Redis에 `verified_session:{userId}` 저장 (TTL 1시간)
2. 민감한 작업 요청 시 → Redis 키 존재 여부 확인
3. 키 존재 → 이메일 인증 생략
4. 키 없음 → 이메일 인증 요청
5. 로그아웃 시 → 해당 키 삭제

#### 필요한 구성요소

| 파일 경로 | 설명 | 상태 |
|----------|------|------|
| `infra/redis/VerifiedSessionRepository.java` | 인증 세션 저장소 | 🔲 예정 |
| `domain/user/service/UserService.java` | 마이페이지 비즈니스 로직 | 🔲 예정 |
| `domain/user/controller/UserController.java` | 마이페이지 API | 🔲 예정 |
| `domain/user/dto/UpdateNicknameRequest.java` | 닉네임 변경 DTO | 🔲 예정 |
| `domain/user/dto/UpdatePasswordRequest.java` | 비밀번호 변경 DTO | 🔲 예정 |
| `domain/user/dto/DeleteAccountRequest.java` | 회원 탈퇴 DTO | 🔲 예정 |

#### 기존 코드 수정 필요

| 파일 경로 | 수정 내용 |
|----------|----------|
| `AuthService.verifyEmail()` | Redis 인증 세션 저장 추가 |
| `AuthService.confirmPasswordReset()` | Redis 인증 세션 저장 추가 |
| `AuthService.logout()` | Redis 인증 세션 삭제 추가 |

### 10.3 프론트엔드 미구현 기능 🔲 진행 예정

#### 이메일 인증 재발송 UI

현재 백엔드 API는 구현되어 있으나 프론트엔드 UI가 없음.

| 기능 | 백엔드 API | 프론트엔드 | 상태 |
|------|-----------|-----------|------|
| 회원가입 인증 재발송 | ✅ `POST /api/v1/auth/resend-verification` | 🔲 미구현 | 예정 |
| 비밀번호 재설정 재발송 | ✅ `POST /api/v1/auth/resend-password-reset` | 🔲 미구현 | 예정 |
| 비밀번호 재설정 페이지 | ✅ `POST /api/v1/auth/password-reset` | 🔲 미구현 | 예정 |
| 비밀번호 재설정 확인 페이지 | ✅ `POST /api/v1/auth/confirm-password-reset` | 🔲 미구현 | 예정 |

#### 필요한 프론트엔드 파일

| 파일 경로 | 설명 | 상태 |
|----------|------|------|
| `src/pages/auth/ForgotPasswordPage.tsx` | 비밀번호 재설정 요청 페이지 | 🔲 예정 |
| `src/pages/auth/ResetPasswordPage.tsx` | 비밀번호 재설정 확인 페이지 | 🔲 예정 |
| `src/pages/auth/EmailVerifyPage.tsx` | 재발송 버튼 추가 (수정) | 🔲 예정 |
| `src/api/auth.ts` | 비밀번호 재설정 API 함수 추가 (수정) | 🔲 예정 |

---

## 11. 다음 단계 체크리스트

### 비밀번호 재설정 프론트엔드

- [ ] 1. `auth.ts`에 비밀번호 재설정 API 함수 추가
- [ ] 2. 비밀번호 재설정 요청 페이지 (`ForgotPasswordPage.tsx`)
- [ ] 3. 비밀번호 재설정 확인 페이지 (`ResetPasswordPage.tsx`)
- [ ] 4. `App.tsx`에 라우트 추가
- [ ] 5. `LoginPage.tsx`에 "비밀번호 찾기" 링크 추가

### 이메일 재발송 기능 프론트엔드

- [ ] 1. `auth.ts`에 재발송 API 함수 추가 (이미 있으면 확인)
- [ ] 2. 회원가입 후 이메일 인증 대기 페이지 (`SignupSuccessPage.tsx`) - 재발송 버튼 포함
- [ ] 3. `SignupPage.tsx` 수정 - 회원가입 성공 시 `SignupSuccessPage`로 이동

### 이메일 인증 캐싱 (Redis)

- [ ] 1. `VerifiedSessionRepository` 생성
- [ ] 2. `AuthService.verifyEmail()` 수정 - 인증 세션 저장
- [ ] 3. `AuthService.confirmPasswordReset()` 수정 - 인증 세션 저장
- [ ] 4. `AuthService.logout()` 수정 - 인증 세션 삭제

### 마이페이지 Backend

- [ ] 1. 마이페이지 DTO 생성 (`UserResponse`, `UpdateNicknameRequest`, `UpdatePasswordRequest`, `DeleteAccountRequest`)
- [ ] 2. `UserService` 생성
- [ ] 3. `UserController` 생성

### 마이페이지 Frontend

- [x] 1. `user.ts` API 함수 생성
- [x] 2. 마이페이지 UI (`MyPage.tsx`)
- [x] 3. Header 컴포넌트에 사용자 정보 + 로그아웃 버튼

---

## 12. 회원 탈퇴 기능

### 12.1 개요

회원 탈퇴는 **이메일 인증**이 필요한 민감한 작업입니다. 로그인 상태(마이페이지)와 비로그인 상태(로그인 화면)에서 모두 접근 가능합니다.

### 12.2 탈퇴 흐름

```
[로그인 상태 - 마이페이지]
1. 마이페이지 → "회원 탈퇴" 버튼 클릭
2. 탈퇴 확인 모달 → "탈퇴하기" 버튼 클릭
3. 이메일 인증 요청 (DELETE_ACCOUNT 타입)
4. 이메일에서 인증 링크 클릭
5. 계정 삭제 완료 → 로그인 페이지로 이동

[비로그인 상태 - 로그인 화면]
1. 로그인 화면 → "회원 탈퇴" 링크 클릭
2. 이메일 입력 → "탈퇴 인증 메일 발송" 버튼 클릭
3. 이메일에서 인증 링크 클릭
4. 계정 삭제 완료 → 로그인 페이지로 이동
```

### 12.3 Backend 구현

#### 생성할 파일

| 파일 경로 | 설명 |
|----------|------|
| `domain/user/dto/DeleteAccountRequest.java` | 회원 탈퇴 요청 DTO (email) |

#### 수정할 파일

| 파일 경로 | 수정 내용 |
|----------|----------|
| `infra/mail/EmailType.java` | `DELETE_ACCOUNT` 타입 추가 |
| `infra/redis/EmailTokenRepository.java` | 탈퇴 토큰 저장/조회/삭제 메서드 추가 |
| `infra/mail/EmailService.java` | `sendDeleteAccountEmail()` 메서드 추가 |
| `domain/user/service/AuthService.java` | `requestDeleteAccount()`, `confirmDeleteAccount()` 메서드 추가 |
| `domain/user/controller/AuthController.java` | 탈퇴 관련 엔드포인트 추가 |

#### API 엔드포인트

| Method | Endpoint | Request | Response | 인증 | 설명 |
|--------|----------|---------|----------|------|------|
| POST | `/api/v1/auth/delete-account` | `DeleteAccountRequest` | `Void` | 불필요 | 탈퇴 인증 이메일 발송 |
| GET | `/api/v1/auth/confirm-delete-account` | `?token=xxx` | `Void` | 불필요 | 계정 삭제 확정 |

#### EmailType 수정

```java
// 위치: infra/mail/EmailType.java

DELETE_ACCOUNT(
    "[INTERVIEW AI] 회원 탈퇴 인증",
    "회원 탈퇴 인증",
    "안녕하세요! AI 면접 시뮬레이터 회원 탈퇴 요청이 접수되었습니다.<br>아래 버튼을 클릭하면 계정이 <strong>영구 삭제</strong>됩니다.<br><br><span style='color: red;'>⚠️ 이 작업은 되돌릴 수 없습니다.</span>",
    "회원 탈퇴 확인",
    "http://localhost:8080/api/v1/auth/confirm-delete-account?token="
);
```

#### EmailTokenRepository 수정

```java
// 위치: infra/redis/EmailTokenRepository.java

private static final String DELETE_ACCOUNT_PREFIX = "email:delete:";

// 회원 탈퇴 토큰 저장
public void saveDeleteAccountToken(String token, Long userId) {
    String key = DELETE_ACCOUNT_PREFIX + token;
    redisTemplate.opsForValue().set(key, userId.toString(), TTL_MINUTES, TimeUnit.MINUTES);
}

// 회원 탈퇴 토큰 조회
public Long findUserIdByDeleteAccountToken(String token) {
    String key = DELETE_ACCOUNT_PREFIX + token;
    String userId = redisTemplate.opsForValue().get(key);
    return userId != null ? Long.parseLong(userId) : null;
}

// 회원 탈퇴 토큰 삭제
public boolean deleteDeleteAccountToken(String token) {
    String key = DELETE_ACCOUNT_PREFIX + token;
    return Boolean.TRUE.equals(redisTemplate.delete(key));
}

// 회원 탈퇴 토큰 존재 여부
public boolean existsDeleteAccountToken(String token) {
    String key = DELETE_ACCOUNT_PREFIX + token;
    return Boolean.TRUE.equals(redisTemplate.hasKey(key));
}
```

#### AuthService 수정

```java
// 위치: domain/user/service/AuthService.java

/**
 * 회원 탈퇴 요청 (이메일 발송)
 */
public void requestDeleteAccount(DeleteAccountRequest request) {
    // 존재하지 않는 이메일이면 조용히 무시 (보안)
    if(userRepository.existsByEmail(request.getEmail())) {
        String token = emailService.generateEmailToken(EmailType.DELETE_ACCOUNT);
        emailService.sendDeleteAccountEmail(request.getEmail(), token);
    }
}

/**
 * 회원 탈퇴 확정
 */
@Transactional(readOnly = false)
public void confirmDeleteAccount(String token) {
    // 1. 토큰 검증
    boolean isExists = emailTokenRepository.existsDeleteAccountToken(token);
    if(!isExists) throw new CustomException(ErrorCode.INVALID_VERIFICATION_TOKEN);

    // 2. 사용자 조회
    Long userId = emailTokenRepository.findUserIdByDeleteAccountToken(token);
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

    // 3. 연관 데이터 삭제 (추후 면접 데이터 등)
    // interviewRepository.deleteByUserId(userId);

    // 4. 사용자 삭제 (Hard Delete)
    userRepository.delete(user);

    // 5. 토큰 삭제
    emailTokenRepository.deleteDeleteAccountToken(token);
}
```

#### AuthController 수정

```java
// 위치: domain/user/controller/AuthController.java

@PostMapping("/delete-account")
public ApiResponse<Void> requestDeleteAccount(@RequestBody @Valid DeleteAccountRequest request) {
    authService.requestDeleteAccount(request);
    return ApiResponse.success();
}

@GetMapping("/confirm-delete-account")
public ApiResponse<Void> confirmDeleteAccount(@RequestParam String token) {
    authService.confirmDeleteAccount(token);
    return ApiResponse.success();  // 또는 프론트엔드로 리다이렉트
}
```

### 12.4 Frontend 구현

#### 생성할 파일

| 파일 경로 | 설명 |
|----------|------|
| `src/pages/auth/DeleteAccountPage.tsx` | 비로그인 상태 탈퇴 요청 페이지 |
| `src/pages/auth/DeleteAccountConfirmPage.tsx` | 탈퇴 완료 페이지 |

#### 수정할 파일

| 파일 경로 | 수정 내용 |
|----------|----------|
| `src/api/auth.ts` | `requestDeleteAccount()`, `confirmDeleteAccount()` 추가 |
| `src/pages/MyPage.tsx` | 회원 탈퇴 버튼 + 모달 추가 |
| `src/pages/auth/LoginPage.tsx` | "회원 탈퇴" 링크 추가 |
| `src/App.tsx` | 탈퇴 관련 라우트 추가 |

#### auth.ts 수정

```typescript
// 위치: src/api/auth.ts

requestDeleteAccount: async (email: string): Promise<void> => {
  await apiClient.post<ApiResponse<void>>('/api/v1/auth/delete-account', { email });
},

confirmDeleteAccount: async (token: string): Promise<void> => {
  await apiClient.get<ApiResponse<void>>(`/api/v1/auth/confirm-delete-account?token=${token}`);
},
```

#### MyPage.tsx 탈퇴 버튼 추가

```tsx
// 위치: src/pages/MyPage.tsx (추가할 부분)

const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteLoading, setDeleteLoading] = useState(false);
const [deleteSuccess, setDeleteSuccess] = useState(false);

const handleDeleteAccount = async () => {
  if (!user?.email) return;

  setDeleteLoading(true);
  try {
    await authApi.requestDeleteAccount(user.email);
    setDeleteSuccess(true);
  } catch (err) {
    // 에러 처리
  } finally {
    setDeleteLoading(false);
  }
};

// JSX 내부
{/* 회원 탈퇴 섹션 */}
<div className="mt-6 pt-6 border-t border-gray-200">
  <button
    onClick={() => setShowDeleteModal(true)}
    className="text-red-600 hover:text-red-800 text-sm"
  >
    회원 탈퇴
  </button>
</div>

{/* 탈퇴 확인 모달 */}
{showDeleteModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      {deleteSuccess ? (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">인증 메일 발송 완료</h3>
          <p className="text-gray-600 mb-4">
            {user?.email}로 탈퇴 인증 메일이 발송되었습니다.<br/>
            메일의 링크를 클릭하면 계정이 삭제됩니다.
          </p>
          <button onClick={() => setShowDeleteModal(false)} className="...">
            확인
          </button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">회원 탈퇴</h3>
          <p className="text-gray-600 mb-4">
            정말 탈퇴하시겠습니까?<br/>
            <span className="text-red-600 font-medium">이 작업은 되돌릴 수 없습니다.</span>
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="...">
              취소
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-red-600 text-white ..."
            >
              {deleteLoading ? '처리 중...' : '탈퇴 인증 메일 발송'}
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}
```

#### DeleteAccountPage.tsx (비로그인 탈퇴)

```tsx
// 위치: src/pages/auth/DeleteAccountPage.tsx

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authApi.requestDeleteAccount(email);
      setSuccess(true);
    } catch (err) {
      setError('요청 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="...">
        <h2>인증 메일 발송 완료</h2>
        <p>
          입력하신 이메일로 탈퇴 인증 메일이 발송되었습니다.<br/>
          메일의 링크를 클릭하면 계정이 삭제됩니다.
        </p>
        <Link to="/login">로그인 페이지로</Link>
      </div>
    );
  }

  return (
    <div className="...">
      <h2>회원 탈퇴</h2>
      <p className="text-red-600">⚠️ 탈퇴 시 모든 데이터가 영구 삭제됩니다.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="가입한 이메일 주소"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? '처리 중...' : '탈퇴 인증 메일 발송'}
        </button>
      </form>
      <Link to="/login">로그인으로 돌아가기</Link>
    </div>
  );
}
```

#### App.tsx 라우트 추가

```tsx
// 위치: src/App.tsx

import DeleteAccountPage from './pages/auth/DeleteAccountPage';
import DeleteAccountConfirmPage from './pages/auth/DeleteAccountConfirmPage';

// Routes 내부
<Route path="/delete-account" element={<DeleteAccountPage />} />
<Route path="/delete-account-confirm" element={<DeleteAccountConfirmPage />} />
```

#### LoginPage.tsx 링크 추가

```tsx
// 위치: src/pages/auth/LoginPage.tsx (비밀번호 찾기 링크 옆에)

<div className="flex justify-between text-sm">
  <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500">
    비밀번호를 잊으셨나요?
  </Link>
  <Link to="/delete-account" className="text-red-600 hover:text-red-500">
    회원 탈퇴
  </Link>
</div>
```

### 12.5 구현 체크리스트

#### Backend

- [x] 1. `DeleteAccountRequest.java` DTO 생성
- [x] 2. `EmailType.java`에 `DELETE_ACCOUNT` 추가
- [x] 3. `EmailTokenRepository.java`에 탈퇴 토큰 메서드 추가
- [x] 4. `EmailService.java`에 `sendDeleteAccountEmail()` 추가
- [x] 5. `AuthService.java`에 `requestDeleteAccount()`, `confirmDeleteAccount()` 추가
- [x] 6. `AuthController.java`에 엔드포인트 추가

#### Frontend

- [x] 1. `auth.ts`에 API 함수 추가
- [x] 2. `DeleteAccountPage.tsx` 생성
- [x] 3. `DeleteAccountConfirmPage.tsx` 생성
- [x] 4. `MyPage.tsx`에 탈퇴 버튼 + 모달 추가
- [x] 5. `LoginPage.tsx`에 탈퇴 링크 추가
- [x] 6. `App.tsx`에 라우트 추가

### 12.6 보안 고려사항

1. **이메일 존재 여부 노출 방지**: 존재하지 않는 이메일로 요청해도 동일한 응답
2. **토큰 만료**: 10분 후 자동 만료 (Redis TTL)
3. **일회성 토큰**: 사용 후 즉시 삭제
4. **Hard Delete**: 사용자 데이터 완전 삭제 (GDPR 준수)

---

## 13. 코드 리팩토링: 공통 컴포넌트

### 13.1 개요

프론트엔드에서 반복되는 UI 패턴을 공통 컴포넌트로 추출하여 코드 중복을 제거하고 유지보수성을 향상시켰습니다.

### 13.2 생성된 공통 컴포넌트

| 파일 경로 | 설명 |
|----------|------|
| `src/components/common/StatusIcon.tsx` | 상태 아이콘 (success, error, warning, info, email) |
| `src/components/common/StatusPage.tsx` | 상태 표시 페이지 레이아웃 |
| `src/components/common/LoadingSpinner.tsx` | 로딩 스피너 |
| `src/components/common/index.ts` | 공통 컴포넌트 export |

### 13.3 StatusIcon 컴포넌트

```typescript
// 위치: src/components/common/StatusIcon.tsx

type StatusType = 'success' | 'error' | 'warning' | 'info' | 'email';

const iconConfig: Record<StatusType, { bg: string; color: string; path: string }> = {
  success: { bg: 'bg-green-100', color: 'text-green-600', path: 'M5 13l4 4L19 7' },
  error: { bg: 'bg-red-100', color: 'text-red-600', path: 'M6 18L18 6M6 6l12 12' },
  warning: { bg: 'bg-red-100', color: 'text-red-600', path: '...' },
  info: { bg: 'bg-blue-100', color: 'text-blue-600', path: '...' },
  email: { bg: 'bg-blue-100', color: 'text-blue-600', path: '...' },
};

export default function StatusIcon({ type }: { type: StatusType }) {
  const config = iconConfig[type];
  return (
    <div className={`w-16 h-16 ${config.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
      <svg className={`w-8 h-8 ${config.color}`} ...>
        <path d={config.path} />
      </svg>
    </div>
  );
}
```

### 13.4 StatusPage 컴포넌트

```typescript
// 위치: src/components/common/StatusPage.tsx

interface StatusPageProps {
  type: StatusType;
  title: string;
  message: string;
  subMessage?: string;
  linkTo?: string;
  linkText?: string;
  children?: React.ReactNode;
}

export default function StatusPage({ type, title, message, subMessage, linkTo, linkText, children }: StatusPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <StatusIcon type={type} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          {subMessage && <p className="text-sm text-gray-500 mb-4">{subMessage}</p>}
          {children}
          {linkTo && linkText && <Link to={linkTo} className="...">...</Link>}
        </div>
      </div>
    </div>
  );
}
```

### 13.5 LoadingSpinner 컴포넌트

```typescript
// 위치: src/components/common/LoadingSpinner.tsx

interface LoadingSpinnerProps {
  color?: string;
  message?: string;
}

export default function LoadingSpinner({ color = 'border-blue-600', message = '처리 중...' }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${color} mx-auto mb-4`}></div>
        <div className="text-gray-600">{message}</div>
      </div>
    </div>
  );
}
```

### 13.6 리팩토링된 페이지

| 페이지 | 변경 전 | 변경 후 |
|--------|---------|---------|
| `EmailVerifyPage.tsx` | 60줄 | 32줄 (47% 감소) |
| `GoogleCallbackPage.tsx` | 70줄 | 59줄 (16% 감소) |
| `NaverCallbackPage.tsx` | 76줄 | 67줄 (12% 감소) |
| `DeleteAccountConfirmPage.tsx` | 112줄 | 75줄 (33% 감소) |

### 13.7 사용 예시

```typescript
// 사용 전
return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div className="max-w-md w-full text-center">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일 인증 완료</h2>
        <p className="text-gray-600 mb-6">이메일 인증이 완료되었습니다. 이제 로그인하실 수 있습니다.</p>
        <Link to="/login" className="...">로그인 하기</Link>
      </div>
    </div>
  </div>
);

// 사용 후
return (
  <StatusPage
    type="success"
    title="이메일 인증 완료"
    message="이메일 인증이 완료되었습니다. 이제 로그인하실 수 있습니다."
    linkTo="/login"
    linkText="로그인 하기"
  />
);
```

---

## 14. Phase 2 최종 완성도

### 14.1 완료된 기능

| 기능 | Backend | Frontend | 상태 |
|------|---------|----------|------|
| 회원가입 | ✅ | ✅ | 완료 |
| 이메일 인증 | ✅ | ✅ | 완료 |
| 로그인/로그아웃 | ✅ | ✅ | 완료 |
| 토큰 갱신 (Refresh) | ✅ | ✅ | 완료 |
| Google OAuth | ✅ | ✅ | 완료 |
| Naver OAuth | ✅ | ✅ | 완료 |
| 비밀번호 재설정 | ✅ | ✅ | 완료 |
| 마이페이지 (프로필 수정) | ✅ | ✅ | 완료 |
| 마이페이지 (비밀번호 변경) | ✅ | ✅ | 완료 |
| 회원 탈퇴 | ✅ | ✅ | 완료 |

### 14.2 프론트엔드 구조

```
frontend/src/
├── api/
│   ├── auth.ts          # 인증 API
│   ├── client.ts        # Axios 인스턴스
│   └── user.ts          # 사용자 API
├── components/
│   ├── auth/
│   │   ├── OAuthButtons.tsx
│   │   └── PrivateRoute.tsx
│   └── common/
│       ├── StatusIcon.tsx
│       ├── StatusPage.tsx
│       ├── LoadingSpinner.tsx
│       └── index.ts
├── hooks/
│   └── useAuth.ts
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── SignupSuccessPage.tsx
│   │   ├── EmailVerifyPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── DeleteAccountPage.tsx
│   │   ├── DeleteAccountConfirmPage.tsx
│   │   ├── GoogleCallbackPage.tsx
│   │   └── NaverCallbackPage.tsx
│   ├── HomePage.tsx
│   └── MyPage.tsx
├── store/
│   └── authStore.ts
├── types/
│   └── index.ts
└── App.tsx
```

### 14.3 다음 단계

Phase 3에서는 면접 시뮬레이션 핵심 기능을 구현합니다:
- 면접 질문 생성 (AI 연동)
- 면접 답변 평가
- 면접 기록 저장
- 면접 통계 조회

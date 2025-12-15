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

### 프론트엔드 보완 (우선)

- [ ] 1. 비밀번호 재설정 요청 페이지 (`ForgotPasswordPage.tsx`)
- [ ] 2. 비밀번호 재설정 확인 페이지 (`ResetPasswordPage.tsx`)
- [ ] 3. 이메일 인증 페이지에 재발송 버튼 추가
- [ ] 4. auth API 함수 추가

### 마이페이지 구현

- [ ] 1. `VerifiedSessionRepository` 생성 (Redis)
- [ ] 2. 기존 AuthService 수정 (인증 세션 저장/삭제)
- [ ] 3. 마이페이지 DTO 생성
- [ ] 4. `UserService` 생성
- [ ] 5. `UserController` 생성
- [ ] 6. 프론트엔드 마이페이지 UI

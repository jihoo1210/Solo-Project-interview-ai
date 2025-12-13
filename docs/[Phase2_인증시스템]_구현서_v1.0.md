# [Phase 2] 인증 시스템 구현서 v1.0

> 작성일: 2024-12-12
> 버전: 1.2 (Task 1~7 완료)
> 작성자: AI Interview Simulator Team

---

## 1. 개요

Phase 2에서는 AI 기술 면접 시뮬레이터의 인증 시스템을 구현합니다. 본 문서는 Task 1~7 완료 시점의 구현 내용을 다룹니다.

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
| Task 8 | Google OAuth 연동 | ⏳ 대기 |
| Task 9 | Naver OAuth 연동 | ⏳ 대기 |
| Task 10-16 | 프론트엔드 UI | ⏳ 대기 |

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

## 7. 다음 단계 (Task 8~9)

| Task | 내용 |
|------|------|
| Task 8 | Google OAuth 연동 |
| Task 9 | Naver OAuth 연동 |

---

## 8. 진행 상황 평가

### Task 1~7 완성도: **100%**

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
| DTO | ✅ 완료 | SignupRequest/Response, UserResponse, ResendVerificationRequest, LoginRequest/Response, TokenRefreshRequest/Response |

### 잘한 점
- `@Value` 불변 객체 DTO 사용
- 정적 팩토리 메서드 패턴 (from, of) 적절한 구분
- 메서드 분리로 가독성 향상
- `@Transactional` 적절한 사용
- 토큰 중복 검사 로직 구현
- 로그인 시 비밀번호 검사 → 이메일 인증 검사 순서 (보안 고려)
- LoginRequest에서 불필요한 `@Pattern` 검증 제거
- RT를 Key로 사용하여 클라이언트가 userId를 보내지 않아도 됨 (보안)
- Refresh Token Rotation 적용 (탈취 대응)
- AT는 짧은 만료, RT는 삭제로 무효화 처리 (성능 + 보안 균형)

### 개선 제안
- 이메일 템플릿 외부 파일로 분리 고려

---

> **Task 1~7 완료!**
> Task 8~9 (OAuth 연동) 진행 준비가 되면 말씀해 주세요.

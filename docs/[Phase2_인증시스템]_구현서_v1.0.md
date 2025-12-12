# [Phase 2] 인증 시스템 구현서 v1.0

> 작성일: 2024-12-12
> 버전: 1.0 (Task 1~2 완료)
> 작성자: AI Interview Simulator Team

---

## 1. 개요

Phase 2에서는 AI 기술 면접 시뮬레이터의 인증 시스템을 구현합니다. 본 문서는 Task 1~2 (엔티티, JWT 설정) 완료 시점의 구현 내용을 다룹니다.

### 1.1 완료된 Task

| Task | 내용 | 상태 |
|------|------|------|
| Task 1 | User, EmailVerification 엔티티 및 Repository | ✅ 완료 |
| Task 2 | Spring Security + JWT 설정 (Access Token) | ✅ 완료 |
| Task 3 | 회원가입 API | ⏳ 대기 |
| Task 4 | 이메일 발송 서비스 | ⏳ 대기 |
| Task 5 | 이메일 인증 API | ⏳ 대기 |
| Task 6 | 로그인/로그아웃 API | ⏳ 대기 |
| Task 7 | 토큰 갱신 API (Refresh Token) | ⏳ 대기 |
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

    @Column(name = "daily_interview_count")
    private int dailyInterviewCount;

    @Column(name = "last_interview_date")
    private LocalDate lastInterviewDate;
}
```

**설명**:
- `@Table(name = "users")`: 실제 DB 테이블명 지정 (user는 예약어)
- `@Enumerated(EnumType.STRING)`: Enum을 문자열로 저장 (가독성 + 안정성)
- `BaseTimeEntity` 상속: `createdAt`, `updatedAt` 자동 관리

---

### 3.2 EmailVerification 엔티티

```java
// 위치: domain/user/entity/EmailVerification.java

@Entity
public class EmailVerification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 100)
    private String token;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column
    private boolean used;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

**설명**:
- `@ManyToOne`: 한 User가 여러 인증 토큰을 가질 수 있음 (재발송 시)
- `used`: 토큰 사용 여부 (중복 사용 방지)
- `expiresAt`: 토큰 만료 시간

---

### 3.3 JwtTokenProvider (JWT 토큰 관리)

```java
// 위치: global/security/jwt/JwtTokenProvider.java

@Service
public class JwtTokenProvider {

    @Value("${jwt.secret}") private String envKey;
    @Value("${jwt.access-token-validity}") private long envExpired;

    private SecretKey key;
    private long expired;

    @PostConstruct
    public void init() {
        String encodedKey = Base64.getEncoder().encodeToString(envKey.getBytes());
        key = Keys.hmacShaKeyFor(encodedKey.getBytes());
        expired = envExpired;
    }

    // JWT 토큰 생성
    public String createJWT(Long userId, String email, SubscriptionType subscriptionType) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + expired);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("subscriptionType", subscriptionType)
                .issuedAt(now)
                .expiration(validity)
                .signWith(key)
                .compact();
    }

    // 요청 헤더에서 토큰 추출
    public String resolveToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if(!StringUtils.isBlank(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // 토큰에서 Claims 추출
    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

**설명**:
- `@PostConstruct`: Bean 생성 후 초기화 (SecretKey 생성)
- `createJWT()`: userId, email, subscriptionType을 담은 JWT 생성
- `resolveToken()`: "Bearer xxx" 형식에서 토큰만 추출
- `validateToken()`: 토큰 파싱 시 예외 발생 여부로 유효성 판단

---

### 3.4 JwtAuthenticationFilter (인증 필터)

```java
// 위치: global/security/jwt/JwtAuthenticationFilter.java

@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = jwtTokenProvider.resolveToken(request);

        if(!StringUtils.isBlank(token)) {
            UserDetails userDetails = userDetailsService
                .loadUserByUsername(jwtTokenProvider.getUserEmail(token));

            if(userDetails != null && jwtTokenProvider.validateToken(token)) {
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

**설명**:
- `OncePerRequestFilter`: 요청당 한 번만 실행되는 필터
- 흐름: 토큰 추출 → 사용자 조회 → 토큰 검증 → SecurityContext에 인증 정보 저장
- `SecurityContextHolder`: 현재 스레드의 인증 정보 저장소

---

### 3.5 UserPrincipal (인증된 사용자 정보)

```java
// 위치: global/security/UserPrincipal.java

@RequiredArgsConstructor
public class UserPrincipal implements UserDetails {

    private final User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();

        if(user.getSubscriptionType().equals(SubscriptionType.FREE)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_FREE"));
        } else if(user.getSubscriptionType().equals(SubscriptionType.PREMIUM)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_PREMIUM"));
            authorities.add(new SimpleGrantedAuthority("ROLE_FREE"));
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }
}
```

**설명**:
- `UserDetails` 구현: Spring Security가 인증 정보를 다루는 표준 인터페이스
- `getAuthorities()`: 사용자 권한 반환 (PREMIUM은 FREE 권한도 포함)
- `getUsername()`: 이메일을 username으로 사용

---

### 3.6 SecurityConfig (보안 설정)

```java
// 위치: global/config/SecurityConfig.java

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/v1/auth/**",
            "/api/v1/oauth/**",
            "/h2-console/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/api-docs/**",
            "/v3/api-docs/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                .anyRequest().authenticated())
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .addFilterAfter(jwtAuthenticationFilter, CorsFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**설명**:
- `SessionCreationPolicy.STATELESS`: JWT 사용으로 세션 비활성화
- `PUBLIC_ENDPOINTS`: 인증 없이 접근 가능한 경로
- `addFilterAfter()`: CORS 필터 다음에 JWT 필터 추가
- `BCryptPasswordEncoder`: 비밀번호 암호화

---

### 3.7 application.yml (JWT 설정)

```yaml
# JWT Configuration
jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-here-must-be-at-least-32-characters-long}
  access-token-validity: 3600000      # 1 hour (밀리초)
  refresh-token-validity: 604800000   # 7 days (밀리초)
```

**설명**:
- `secret`: JWT 서명에 사용할 비밀 키 (환경변수 우선)
- `access-token-validity`: Access Token 유효 시간 (1시간)
- `refresh-token-validity`: Refresh Token 유효 시간 (7일) - Task 7에서 사용

---

## 4. JWT 인증 흐름도

```
[클라이언트 요청]
        │
        ▼
┌─────────────────────────────────────┐
│     JwtAuthenticationFilter         │
│  ┌───────────────────────────────┐  │
│  │ 1. resolveToken()             │  │
│  │    → Authorization 헤더에서   │  │
│  │      "Bearer xxx" 토큰 추출   │  │
│  └───────────────────────────────┘  │
│                 │                   │
│                 ▼                   │
│  ┌───────────────────────────────┐  │
│  │ 2. validateToken()            │  │
│  │    → 토큰 서명/만료 검증      │  │
│  └───────────────────────────────┘  │
│                 │                   │
│                 ▼                   │
│  ┌───────────────────────────────┐  │
│  │ 3. loadUserByUsername()       │  │
│  │    → DB에서 사용자 조회       │  │
│  └───────────────────────────────┘  │
│                 │                   │
│                 ▼                   │
│  ┌───────────────────────────────┐  │
│  │ 4. SecurityContextHolder      │  │
│  │    → 인증 정보 저장           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
        │
        ▼
[컨트롤러 → 서비스 → 응답]
```

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

## 7. 다음 단계 (Task 3~9)

| Task | 내용 |
|------|------|
| Task 3 | 회원가입 API (SignupRequest/Response, AuthService, AuthController) |
| Task 4 | 이메일 발송 서비스 (Spring Mail + SMTP) |
| Task 5 | 이메일 인증 API (토큰 검증/재발송) |
| Task 6 | 로그인/로그아웃 API |
| Task 7 | 토큰 갱신 API (Refresh Token 구현) |
| Task 8 | Google OAuth 연동 |
| Task 9 | Naver OAuth 연동 |

---

## 8. 진행 상황 평가

### Task 1~2 완성도: **100%**

| 항목 | 상태 | 비고 |
|------|------|------|
| User 엔티티 | ✅ 완료 | 기획서 스펙 준수 |
| EmailVerification 엔티티 | ✅ 완료 | @ManyToOne 관계 설정 |
| AuthProvider Enum | ✅ 완료 | NAVER로 변경 (KAKAO 사업자 이슈) |
| SubscriptionType Enum | ✅ 완료 | FREE, PREMIUM |
| UserRepository | ✅ 완료 | findByEmail, existsByEmail |
| EmailVerificationRepository | ✅ 완료 | findByToken, findByUserAndUsedFalse |
| JwtTokenProvider | ✅ 완료 | 생성/검증/추출 |
| JwtAuthenticationFilter | ✅ 완료 | OncePerRequestFilter |
| UserPrincipal | ✅ 완료 | ROLE 기반 권한 |
| SecurityConfig | ✅ 완료 | JWT 필터 연동 |

### 잘한 점
- `@ManyToOne` vs `@OneToMany` 차이점 이해
- `StringUtils.isBlank()` 사용으로 방어적 코딩
- `@Component`로 Filter Bean 등록 해결

### 개선 제안
- 추후 Refresh Token 구현 시 별도 엔티티 또는 Redis 저장 고려
- 토큰 만료 시 상세 에러 메시지 반환 고려

---

> **Task 1~2 완료!**
> Task 3~9 진행 준비가 되면 말씀해 주세요.

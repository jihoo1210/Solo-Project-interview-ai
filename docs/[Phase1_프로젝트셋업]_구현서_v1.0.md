# [Phase 1] 프로젝트 셋업 구현서 v1.0

> 작성일: 2024-12-12  
> 버전: 1.0  
> 작성자: AI Interview Simulator Team

---

## 1. 개요

Phase 1에서는 AI 기술 면접 시뮬레이터의 기본 프로젝트 구조를 설정했습니다. Backend(Spring Boot)와 Frontend(React + Vite)를 모노레포 구조로 구성하고, 개발에 필요한 기본 설정을 완료했습니다.

---

## 2. 생성된 파일 목록

### 2.1 Backend (Spring Boot)

| 파일 경로 | 설명 |
|----------|------|
| `backend/build.gradle` | Gradle 빌드 설정 (의존성 정의) |
| `backend/src/main/resources/application.yml` | 애플리케이션 설정 (멀티 프로파일) |
| `backend/src/main/java/com/interviewai/InterviewAiBackendApplication.java` | 메인 애플리케이션 클래스 |
| `backend/src/main/java/com/interviewai/global/common/ApiResponse.java` | 공통 API 응답 포맷 |
| `backend/src/main/java/com/interviewai/global/common/BaseTimeEntity.java` | JPA Auditing 기본 엔티티 |
| `backend/src/main/java/com/interviewai/global/config/JpaConfig.java` | JPA Auditing 설정 |
| `backend/src/main/java/com/interviewai/global/config/SecurityConfig.java` | Spring Security 설정 |
| `backend/src/main/java/com/interviewai/global/config/SwaggerConfig.java` | Swagger/OpenAPI 설정 |
| `backend/src/main/java/com/interviewai/global/exception/ErrorCode.java` | 에러 코드 Enum 정의 |
| `backend/src/main/java/com/interviewai/global/exception/CustomException.java` | 커스텀 예외 클래스 |
| `backend/src/main/java/com/interviewai/global/exception/GlobalExceptionHandler.java` | 전역 예외 처리기 |

### 2.2 Frontend (React + Vite)

| 파일 경로 | 설명 |
|----------|------|
| `frontend/package.json` | npm 패키지 설정 |
| `frontend/vite.config.ts` | Vite 빌드 설정 |
| `frontend/tsconfig.json` | TypeScript 설정 |
| `frontend/postcss.config.js` | PostCSS 설정 (Tailwind v4) |
| `frontend/eslint.config.js` | ESLint 설정 |
| `frontend/.prettierrc` | Prettier 설정 |
| `frontend/src/index.css` | Tailwind CSS 진입점 |
| `frontend/src/types/index.ts` | TypeScript 타입 정의 |
| `frontend/src/api/client.ts` | Axios API 클라이언트 |
| `frontend/src/store/authStore.ts` | Zustand 인증 상태 관리 |
| `frontend/.env.example` | 환경변수 예시 파일 |

### 2.3 공통

| 파일 경로 | 설명 |
|----------|------|
| `.gitignore` | Git 무시 파일 설정 |

---

## 3. 주요 변경 내용

### 3.1 기술 스택 구성

#### Backend
- **Java 17** + **Spring Boot 3.4.1**
- **Spring Security** (JWT 인증 준비)
- **Spring Data JPA** + **H2/MariaDB** (멀티 프로파일)
- **Spring Data Redis** (세션/캐싱 준비)
- **SpringDoc OpenAPI** (Swagger UI)
- **JJWT 0.12.6** (JWT 토큰 처리)
- **OpenAI Java Client** (AI 연동 준비)

#### Frontend
- **React 18** + **TypeScript**
- **Vite 7.x** (빌드 도구)
- **Tailwind CSS v4** (스타일링)
- **Axios** (HTTP 클라이언트)
- **Zustand** (상태 관리)
- **React Query** (서버 상태 관리)
- **React Router DOM** (라우팅)
- **Recharts** (차트)

### 3.2 프로젝트 구조

```
Solo-Project-interview-ai/
├── backend/
│   ├── src/main/java/com/interviewai/
│   │   ├── domain/           # 도메인별 패키지
│   │   │   ├── user/
│   │   │   ├── interview/
│   │   │   ├── question/
│   │   │   ├── answer/
│   │   │   ├── payment/
│   │   │   └── questionbank/
│   │   ├── global/           # 공통 모듈
│   │   │   ├── common/       # 공통 클래스
│   │   │   ├── config/       # 설정 클래스
│   │   │   ├── exception/    # 예외 처리
│   │   │   └── security/     # 보안 관련
│   │   └── infra/            # 외부 연동
│   │       ├── openai/
│   │       └── payment/
│   └── src/main/resources/
│       └── application.yml
├── frontend/
│   └── src/
│       ├── api/              # API 클라이언트
│       ├── components/       # 재사용 컴포넌트
│       ├── hooks/            # 커스텀 훅
│       ├── pages/            # 페이지 컴포넌트
│       ├── store/            # 상태 관리
│       ├── types/            # 타입 정의
│       └── utils/            # 유틸리티
└── docs/                     # 문서
```

---

## 4. 주요 코드 설명

### 4.1 Backend - ApiResponse (공통 응답 포맷)

```java
// 위치: backend/src/main/java/com/interviewai/global/common/ApiResponse.java

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private final boolean success;      // 성공 여부
    private final T data;               // 응답 데이터
    private final ErrorResponse error;  // 에러 정보
    private final LocalDateTime timestamp;

    // 성공 응답 생성
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 에러 응답 생성
    public static <T> ApiResponse<T> error(ErrorResponse errorResponse) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(errorResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
```

**설명**: 모든 API 응답을 통일된 형식으로 반환합니다. `success` 필드로 성공/실패를 구분하고, 성공 시 `data`, 실패 시 `error` 필드를 포함합니다.

---

### 4.2 Backend - ErrorCode (에러 코드 정의)

```java
// 위치: backend/src/main/java/com/interviewai/global/exception/ErrorCode.java

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // Common Errors (1xxx)
    INTERNAL_SERVER_ERROR(1000, HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),
    VALIDATION_ERROR(1002, HttpStatus.BAD_REQUEST, "유효성 검증에 실패했습니다."),
    
    // Auth Errors (2xxx)
    UNAUTHORIZED(2000, HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    INVALID_CREDENTIALS(2003, HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 일치하지 않습니다."),
    DUPLICATE_EMAIL(2005, HttpStatus.CONFLICT, "이미 존재하는 이메일입니다."),
    
    // ... 생략

    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
```

**설명**: 도메인별로 에러 코드를 분류하여 관리합니다. 코드 번호로 에러 유형을 빠르게 파악할 수 있습니다.

---

### 4.3 Backend - SecurityConfig (보안 설정)

```java
// 위치: backend/src/main/java/com/interviewai/global/config/SecurityConfig.java

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/v1/auth/**",
            "/api/v1/oauth/**",
            "/h2-console/**",
            "/swagger-ui/**",
            // ...
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)  // REST API이므로 CSRF 비활성화
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // JWT 사용
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                .anyRequest().authenticated());

        return http.build();
    }
}
```

**설명**: 
- JWT 기반 인증을 위해 세션을 STATELESS로 설정
- 인증이 필요 없는 엔드포인트(로그인, Swagger 등)를 PUBLIC_ENDPOINTS로 분리
- CORS 설정으로 프론트엔드(localhost:5173)와의 통신 허용

---

### 4.4 Frontend - API Client (Axios 인터셉터)

```typescript
// 위치: frontend/src/api/client.ts

// Request Interceptor - 토큰 자동 첨부
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - 토큰 만료 시 자동 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<never>>) => {
    // 401 에러 발생 시 refresh token으로 재시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      // ... 토큰 갱신 로직
    }
    return Promise.reject(apiError);
  }
);
```

**설명**:
- **Request Interceptor**: 모든 요청에 JWT 토큰을 자동으로 헤더에 첨부
- **Response Interceptor**: 401 에러(토큰 만료) 발생 시 자동으로 토큰 갱신 후 재요청

---

### 4.5 Frontend - Auth Store (Zustand)

```typescript
// 위치: frontend/src/store/authStore.ts

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      }),

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    { name: 'auth-storage' }  // localStorage 키 이름
  )
);
```

**설명**:
- **Zustand**: 가벼운 상태 관리 라이브러리 (Redux 대비 보일러플레이트 최소화)
- **persist**: 상태를 localStorage에 자동 저장/복원
- **isLoading**: 초기 로딩 상태 관리로 깜빡임 방지

---

### 4.6 Backend - application.yml (멀티 프로파일)

```yaml
# 위치: backend/src/main/resources/application.yml

spring:
  profiles:
    active: local  # 기본 프로파일

---
# Local 프로파일 (개발용)
spring:
  config:
    activate:
      on-profile: local
  datasource:
    url: jdbc:h2:mem:interviewai  # 인메모리 DB
    driver-class-name: org.h2.Driver
  h2:
    console:
      enabled: true  # H2 콘솔 활성화

---
# Prod 프로파일 (운영용)
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: jdbc:mariadb://localhost:3306/interview_ai
    driver-class-name: org.mariadb.jdbc.Driver
```

**설명**:
- **멀티 프로파일**: `---`로 구분하여 환경별 설정 분리
- **Local**: H2 인메모리 DB 사용 (빠른 개발, 재시작 시 초기화)
- **Prod**: MariaDB 사용 (실제 데이터 영속화)
- 실행 시 `-Dspring.profiles.active=prod`로 프로파일 전환

---

## 5. 에러 해결 과정 (학생 작성)

> 이 섹션은 학생이 직접 작성합니다. 개발 중 발생한 에러와 해결 과정을 기록하세요.

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

# Gradle Wrapper로 실행
./gradlew bootRun

# 또는 IDE에서 InterviewAiBackendApplication.java 실행
```

- 접속 URL: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console

### 6.2 Frontend 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

- 접속 URL: http://localhost:5173

---

## 7. 다음 단계 (Phase 2 예고)

Phase 2에서는 **인증 시스템**을 구현합니다:

1. **User 엔티티** 생성 및 JPA 매핑
2. **JWT 인증** 구현 (Access Token + Refresh Token)
3. **회원가입/로그인 API** 구현
4. **이메일 인증** 기능
5. **소셜 로그인** (Google, Kakao)

---

## 8. 진행 상황 평가

| 항목 | 상태 | 비고 |
|------|------|------|
| Backend 프로젝트 구조 | ✅ 완료 | 도메인 기반 패키지 구조 |
| Frontend 프로젝트 구조 | ✅ 완료 | Vite + React + TypeScript |
| 공통 응답 포맷 | ✅ 완료 | ApiResponse |
| 예외 처리 구조 | ✅ 완료 | GlobalExceptionHandler |
| 보안 설정 | ✅ 완료 | SecurityConfig (기본) |
| API 문서화 | ✅ 완료 | SpringDoc/Swagger |
| 상태 관리 | ✅ 완료 | Zustand + persist |
| API 클라이언트 | ✅ 완료 | Axios + 인터셉터 |

### 완성도: **100%** (Phase 1 기준)

### 개선 제안
1. 환경 변수 관리를 위해 `.env` 파일 활용 권장
2. Backend 테스트 코드 작성 습관화 필요
3. Git 커밋 메시지 컨벤션 정립 권장 (예: Conventional Commits)

---

> **Phase 1 완료!** 🎉
> Phase 2 진행 준비가 되면 말씀해 주세요.

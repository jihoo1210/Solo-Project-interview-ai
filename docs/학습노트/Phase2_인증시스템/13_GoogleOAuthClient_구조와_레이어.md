# GoogleOAuthClient 구조와 레이어

## 질문
> GoogleOAuthClient는 컨트롤러로 구현해야 해? 아니면 서비스야?

---

## 답변: 둘 다 아님 - Infrastructure Layer

GoogleOAuthClient는 **컨트롤러도 서비스도 아닙니다**.

### 레이어 구분

```
┌─────────────────────────────────────────────────────────┐
│  Controller (API Layer)                                  │
│  - HTTP 요청/응답 처리                                    │
│  - @RestController                                       │
│  예: OAuthController.java                                │
└─────────────────────────┬───────────────────────────────┘
                          │ 호출
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Service (Business Layer)                                │
│  - 비즈니스 로직 처리                                     │
│  - @Service                                              │
│  예: OAuthService.java                                   │
└─────────────────────────┬───────────────────────────────┘
                          │ 호출
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Infrastructure (외부 연동 Layer)                        │
│  - 외부 API 통신 담당                                    │
│  - @Component 또는 @Service                              │
│  예: GoogleOAuthClient.java  ← 여기!                     │
└─────────────────────────────────────────────────────────┘
```

### 왜 infra 레이어인가?

| 레이어 | 역할 | GoogleOAuthClient? |
|--------|------|-------------------|
| **Controller** | 클라이언트(프론트엔드)의 HTTP 요청을 받음 | ❌ 구글 요청 안 받음 |
| **Service** | 우리 서비스의 비즈니스 로직 | ❌ 비즈니스 로직 아님 |
| **Infra** | 외부 시스템(구글, DB 등)과 통신 | ✅ 구글 API 호출 |

### 패키지 구조

```
com.interviewai.backend/
├── domain/
│   └── user/
│       ├── controller/
│       │   └── OAuthController.java      ← @RestController
│       └── service/
│           └── OAuthService.java         ← @Service
│
└── infra/
    └── oauth/
        └── google/
            ├── GoogleOAuthProperties.java
            ├── GoogleOAuthClient.java    ← @Component (외부 API 통신)
            └── dto/
                ├── GoogleTokenResponse.java
                └── GoogleUserInfo.java
```

### 어노테이션 선택

```java
@Component  // 또는 @Service도 가능 (기능상 차이 없음)
@RequiredArgsConstructor
public class GoogleOAuthClient {

    private final RestTemplate restTemplate;

    // 구글 API 호출 메서드들...
}
```

**`@Component` vs `@Service`**:
- 기능적으로 동일 (둘 다 Spring Bean 등록)
- `@Service`는 "비즈니스 로직"이라는 의미적 뉘앙스
- `@Component`는 "일반 컴포넌트"라는 의미
- infra 레이어는 보통 `@Component` 사용 (의미상 더 적합)

---

## 관련 파일
- `infra/oauth/google/GoogleOAuthClient.java`
- `domain/user/controller/OAuthController.java`
- `domain/user/service/OAuthService.java`

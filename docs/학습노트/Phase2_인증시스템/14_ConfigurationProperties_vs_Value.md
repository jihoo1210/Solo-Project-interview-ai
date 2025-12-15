# @ConfigurationProperties vs @Value

## 질문
> @ConfigurationProperties 사용 안하는 이유가 뭐야?

---

## 답변: 설정이 많으면 @ConfigurationProperties 권장

### 두 가지 방식

**방식 A: @Value (간단한 경우)**
```java
@Component
public class GoogleOAuthClient {

    @Value("${oauth2.google.client-id}")
    private String clientId;

    @Value("${oauth2.google.client-secret}")
    private String clientSecret;

    @Value("${oauth2.google.token-uri}")
    private String tokenUri;

    // ... 여러 개의 @Value
}
```

**방식 B: @ConfigurationProperties (설정이 많은 경우)**
```java
@Getter
@Setter
@ConfigurationProperties(prefix = "oauth2.google")
public class GoogleOAuthProperties {
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String scope;
    private String tokenUri;
    private String userInfoUri;
}
```

### 비교

| 기준 | @Value | @ConfigurationProperties |
|------|--------|--------------------------|
| 설정 개수 | 1~3개 | 4개 이상 |
| 타입 안전성 | ❌ 문자열 기반 | ✅ 타입 체크 |
| IDE 자동완성 | ❌ | ✅ |
| 유효성 검증 | 수동 | @Validated 사용 가능 |
| 복잡도 | 낮음 | 높음 (별도 클래스 필요) |

### 이 프로젝트에서의 선택

Google OAuth 설정이 **6개**이므로 `@ConfigurationProperties`가 더 적합:

```yaml
oauth2.google:
  - client-id
  - client-secret
  - redirect-uri
  - scope
  - token-uri
  - user-info-uri
```

### 사용 구조

```
infra/oauth/google/
├── GoogleOAuthProperties.java   ← 설정 값 보관
├── GoogleOAuthClient.java       ← API 호출 (Properties 주입받음)
└── dto/
```

**GoogleOAuthProperties.java**:
```java
@Getter
@Setter
@ConfigurationProperties(prefix = "oauth2.google")
public class GoogleOAuthProperties {
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String scope;
    private String tokenUri;
    private String userInfoUri;
}
```

**활성화 필요** (Main 클래스 또는 Config):
```java
@EnableConfigurationProperties(GoogleOAuthProperties.class)
```

---

## 관련 파일
- `infra/oauth/google/GoogleOAuthProperties.java`

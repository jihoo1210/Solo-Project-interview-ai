# DTO Jackson 초기화 원리

## 질문
> @NoArgsConstructor만 있고 모든 필드를 인수로 받는 생성자가 없으면 어떻게 해당 Dto가 초기화 되나요?

---

## 답변: Jackson이 리플렉션으로 초기화

### Jackson의 동작 원리

`@NoArgsConstructor`만 있어도 Jackson(JSON 라이브러리)이 **리플렉션**으로 초기화합니다:

```
1. 기본 생성자로 빈 객체 생성  →  new GoogleTokenResponse()
2. JSON 필드를 setter 또는 리플렉션으로 주입  →  accessToken = "ya29..."
```

### 동작 흐름

```java
// RestTemplate이 구글 응답을 받으면
restTemplate.postForObject(url, request, GoogleTokenResponse.class);

// 내부적으로 Jackson이:
// 1. 기본 생성자 호출
GoogleTokenResponse dto = new GoogleTokenResponse();

// 2. 리플렉션으로 private 필드에 직접 값 주입
Field field = dto.getClass().getDeclaredField("accessToken");
field.setAccessible(true);  // private 접근 허용
field.set(dto, "ya29.a0AfH6SMC...");
```

### 왜 @Setter 없이도 동작?

Jackson은 **두 가지 방식**으로 값을 주입:

| 방식 | 조건 |
|------|------|
| Setter 사용 | `setAccessToken()` 메서드가 있으면 |
| 리플렉션 | Setter 없으면 필드에 직접 주입 |

### @AllArgsConstructor가 필요한 경우

```java
// 우리가 직접 코드에서 생성할 때
GoogleTokenResponse response = new GoogleTokenResponse(
    "token", 3600, "Bearer", "email", "idToken"
);
```

하지만 이 DTO들은 **구글 API 응답을 받기만** 하므로:
- Jackson이 자동 생성 → `@NoArgsConstructor`만 필요
- 우리가 직접 생성 안 함 → `@AllArgsConstructor` 불필요

### 정리

```java
@Getter              // 값 읽기용
@NoArgsConstructor   // Jackson이 객체 생성용
public class GoogleTokenResponse {
    // Jackson이 리플렉션으로 값 주입
    private String accessToken;
}
```

| 어노테이션 | 용도 | 필요 여부 |
|-----------|------|----------|
| `@NoArgsConstructor` | Jackson 객체 생성 | 필수 |
| `@Getter` | 값 조회 | 필수 |
| `@Setter` | 값 설정 | 불필요 (리플렉션) |
| `@AllArgsConstructor` | 직접 생성 | 불필요 |

---

## 관련 파일
- `infra/oauth/google/dto/GoogleTokenResponse.java`
- `infra/oauth/google/dto/GoogleUserInfo.java`

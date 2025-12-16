# Spring AI ChatClient

> 작성일: 2024-12-16
> Phase: 3 - 면접 시뮬레이션

---

## 1. 질문

ChatClient가 뭐야? @Bean으로 등록 안 해도 돼?

---

## 2. ChatClient란?

Spring AI에서 제공하는 **AI 모델과 통신하기 위한 클라이언트**입니다.

OpenAI, Google Gemini, Anthropic Claude 등 다양한 AI 모델을 **동일한 인터페이스**로 사용할 수 있게 해줍니다.

### 핵심 특징

- **Fluent API**: 메서드 체이닝으로 직관적인 사용
- **모델 추상화**: 어떤 AI 모델이든 동일한 방식으로 호출
- **자동 설정**: Spring Boot Auto-configuration 지원

---

## 3. 기본 사용법

```java
String response = chatClient.prompt()
        .user("사용자 프롬프트")      // 사용자 메시지
        .call()                       // AI 호출
        .content();                   // 응답 텍스트 추출
```

### 시스템 프롬프트 추가

```java
String response = chatClient.prompt()
        .system("당신은 기술 면접관입니다.")  // 시스템 역할 설정
        .user("Java의 특징을 설명해주세요.")
        .call()
        .content();
```

---

## 4. Bean 등록 방법

### 4.1 자동 등록 (Spring AI 1.0.0+)

`ChatClient.Builder`가 **자동으로 Bean 등록**됩니다.

```java
@Service
public class GeminiService {
    private final ChatClient chatClient;

    // Builder를 주입받아 직접 build()
    public GeminiService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }
}
```

### 4.2 수동 등록 (권장)

`@Configuration` 클래스에서 Bean으로 등록하면 `@RequiredArgsConstructor` 사용 가능:

```java
// AiConfig.java
@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }
}

// GeminiService.java
@RequiredArgsConstructor
@Service
public class GeminiService {
    private final ChatClient chatClient;  // 바로 주입 가능
}
```

---

## 5. Builder vs 직접 주입 비교

| 방식 | 장점 | 단점 |
|------|------|------|
| Builder 주입 | 별도 설정 불필요 | 생성자 직접 작성 필요 |
| Bean 등록 | `@RequiredArgsConstructor` 사용 가능 | Config 파일 추가 필요 |

---

## 6. application.yml 설정

```yaml
spring:
  ai:
    google:
      genai:
        api-key: ${GEMINI_API_KEY}
        chat:
          options:
            model: gemini-1.5-flash  # 또는 gemini-1.5-pro
            temperature: 0.7
```

### 주요 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `model` | 사용할 모델 | gemini-1.5-flash |
| `temperature` | 창의성 (0.0~1.0) | 0.7 |
| `max-output-tokens` | 최대 응답 토큰 수 | - |

---

## 7. 프로젝트 적용 예시

```java
@RequiredArgsConstructor
@Service
public class GeminiService implements AiService {

    private final ChatClient chatClient;

    @Override
    public String generateQuestion(Interview interview, Answer previousAnswer) {
        String prompt = buildQuestionPrompt(interview, previousAnswer);

        return chatClient.prompt()
                .system("당신은 " + interview.getType().getDescription() + " 면접관입니다.")
                .user(prompt)
                .call()
                .content();
    }

    private String buildQuestionPrompt(Interview interview, Answer previousAnswer) {
        if (previousAnswer == null) {
            return String.format(
                "난이도: %s\n첫 번째 면접 질문을 생성해주세요.",
                interview.getDifficulty().getDescription()
            );
        }
        return String.format(
            "이전 질문: %s\n이전 답변: %s\n다음 질문을 생성해주세요.",
            previousAnswer.getQuestion().getContent(),
            previousAnswer.getContent()
        );
    }
}
```

---

## 8. 핵심 정리

1. **ChatClient**: Spring AI의 AI 통신 클라이언트
2. **자동 설정**: `ChatClient.Builder`는 자동 Bean 등록
3. **수동 등록 권장**: Config에서 `ChatClient` Bean 등록하면 편리
4. **Fluent API**: `.prompt().user().call().content()` 패턴

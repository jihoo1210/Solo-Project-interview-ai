# Spring AI Google GenAI project-id 오류 해결

> 작성일: 2025-12-17
> 관련 기술: Spring AI 1.1.2, Google Gemini API, AWS Elastic Beanstalk

---

## 1. 문제 상황

### 1.1 오류 메시지
```
Caused by: java.lang.IllegalArgumentException: Google GenAI project-id must be set!
at org.springframework.ai.model.google.genai.autoconfigure.chat.GoogleGenAiChatAutoConfiguration.googleGenAiClient(GoogleGenAiChatAutoConfiguration.java:77)
```

### 1.2 발생 환경
- **로컬**: 정상 작동
- **배포 (Elastic Beanstalk)**: 500 Internal Server Error

### 1.3 혼란스러웠던 점
- Spring AI 문서에서는 API Key만 있으면 된다고 설명
- 로컬에서는 `project-id` 없이도 정상 작동
- 배포 환경에서만 오류 발생

---

## 2. 원인 분석

### 2.1 로컬 vs 배포 환경 차이

| 환경 | Google SDK 설치 | Fallback |
|------|----------------|----------|
| 로컬 (개발자 PC) | 설치됨 (gcloud CLI 등) | Google SDK가 자동으로 프로젝트 정보 제공 |
| Elastic Beanstalk | 미설치 | Fallback 없음 → 즉시 실패 |

### 2.2 Spring AI AutoConfiguration 동작
```java
// GoogleGenAiChatAutoConfiguration.java:77
public Client googleGenAiClient() {
    // project-id가 없으면 IllegalArgumentException 발생
    if (projectId == null || projectId.isEmpty()) {
        throw new IllegalArgumentException("Google GenAI project-id must be set!");
    }
    // ...
}
```

### 2.3 핵심 결론
> **Google GenAI는 `project-id`가 무조건 필요하다.**
> 로컬에서 작동한 것은 Google SDK fallback 덕분이었음.

---

## 3. 해결 방법

### 3.1 Google AI Studio에서 Project ID 확인

1. [Google AI Studio](https://aistudio.google.com/) 접속
2. 좌측 메뉴 → API Keys 클릭
3. 사용 중인 API Key 옆의 프로젝트 정보 확인
4. Project ID 복사 (예: `gen-lang-client-0514433569`)

### 3.2 application.yml 설정

```yaml
# Local Profile
spring:
  ai:
    google:
      genai:
        api-key: ${GOOGLE_AI_API_KEY}
        project-id: ${GOOGLE_AI_PROJECT_ID:gen-lang-client-0514433569}  # 기본값 설정
        chat:
          options:
            model: gemini-2.0-flash-lite

---
# Production Profile
spring:
  ai:
    google:
      genai:
        api-key: ${GOOGLE_AI_API_KEY}
        project-id: ${GOOGLE_AI_PROJECT_ID:gen-lang-client-0514433569}  # 기본값 설정
        chat:
          options:
            model: gemini-2.0-flash-lite
```

### 3.3 환경변수 설정 (Elastic Beanstalk)

**필수 환경변수:**
- `GOOGLE_AI_API_KEY`: Google AI API 키

**선택 환경변수 (기본값 사용 시 불필요):**
- `GOOGLE_AI_PROJECT_ID`: Google Cloud 프로젝트 ID

### 3.4 build.gradle 설정 확인

```gradle
ext {
    set('springAiVersion', "1.1.2")
}

dependencies {
    // Spring AI - Gemini
    implementation 'org.springframework.ai:spring-ai-starter-model-google-genai'
}

dependencyManagement {
    imports {
        mavenBom "org.springframework.ai:spring-ai-bom:${springAiVersion}"
    }
}
```

---

## 4. 트러블슈팅 과정 요약

### 시도 1: project-id 제거 (실패)
- 문서에서 API Key만 필요하다고 해서 project-id 제거
- 결과: 동일한 오류 발생

### 시도 2: Spring AI 1.2.0으로 업그레이드 (실패)
- 최신 버전으로 해결 시도
- 결과: Maven Central에 1.2.0 아티팩트 없음 (아직 릴리즈 안됨)

### 시도 3: RestTemplate 직접 API 호출로 변경 (중단)
- Spring AI 의존성 제거하고 직접 REST API 호출
- 결과: 작동하지만 ChatClient 편의성 손실

### 시도 4: project-id 기본값 설정 (성공)
- `${GOOGLE_AI_PROJECT_ID:gen-lang-client-0514433569}` 형태로 기본값 설정
- 결과: 배포 성공

---

## 5. 배운 점

### 5.1 로컬과 배포 환경 차이
- 로컬에서 작동한다고 배포에서도 작동하는 것은 아님
- SDK fallback, 환경변수, 설치된 도구 등이 다를 수 있음

### 5.2 문서 vs 실제 동작
- 공식 문서가 항상 정확하지는 않음
- 특히 AutoConfiguration의 실제 동작은 소스코드 확인 필요

### 5.3 환경변수 기본값 설정
```yaml
# 기본값 설정 문법
${ENV_VAR:default-value}

# 예시
project-id: ${GOOGLE_AI_PROJECT_ID:gen-lang-client-0514433569}
```
- 환경변수가 없으면 기본값 사용
- 배포 환경에서 환경변수 설정 누락 시 안전망 역할

### 5.4 디버깅 전략
1. 오류 스택 트레이스에서 정확한 위치 확인
2. 해당 AutoConfiguration 클래스 소스코드 확인
3. 로컬 vs 배포 환경 차이점 분석
4. 가장 단순한 해결책부터 시도

---

## 6. 관련 링크

- [Spring AI 공식 문서](https://docs.spring.io/spring-ai/reference/)
- [Google AI Studio](https://aistudio.google.com/)
- [Spring AI GitHub](https://github.com/spring-projects/spring-ai)

---

## 7. 체크리스트

배포 전 확인사항:

- [ ] `application.yml`에 `project-id` 설정 확인
- [ ] `GOOGLE_AI_API_KEY` 환경변수 설정 확인
- [ ] 로컬 빌드 테스트 통과
- [ ] 프로필별 (local/prod) 설정 동일하게 적용

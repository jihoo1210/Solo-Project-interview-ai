# SwaggerConfig 설정 이해

> 작성일: 2024-12-12
> 관련 Phase: Phase 1
> 파일 위치: `backend/src/main/java/com/interviewai/global/config/SwaggerConfig.java`

---

## 1. OpenAPI(Swagger) 문서를 만드는 이유

### 1.1 API 명세의 자동화

수동으로 API 문서를 작성하면 코드와 문서가 불일치하는 문제가 생깁니다.

```
❌ 수동 문서 관리의 문제점:
1. API 수정 → 문서 업데이트 잊음 → 문서와 실제 API 불일치
2. 새 API 추가 → 문서 작성 귀찮음 → 문서 누락
3. 시간이 지날수록 문서 신뢰도 하락
```

OpenAPI는 코드에서 자동으로 문서를 생성하여 **항상 최신 상태 유지**가 가능합니다.

### 1.2 프론트엔드 개발자와의 협업

프론트엔드 개발자가 백엔드 API를 이해하기 위해 필요한 정보:
- 어떤 엔드포인트가 있는지
- 어떤 HTTP 메서드를 사용하는지
- 어떤 파라미터를 보내야 하는지
- 어떤 응답이 오는지
- 인증이 필요한지

Swagger UI를 통해 **문서를 보면서 바로 테스트**할 수 있습니다.

### 1.3 API 테스트 도구

Postman 없이도 브라우저에서 직접 API를 호출하고 테스트할 수 있습니다.

```
Swagger UI vs Postman:

┌─────────────────┬─────────────────┬─────────────────┐
│     항목        │   Swagger UI    │    Postman      │
├─────────────────┼─────────────────┼─────────────────┤
│ 설치 필요       │      X          │       O         │
│ 문서와 통합     │      O          │       X         │
│ 자동 업데이트   │      O          │       X         │
│ 팀 공유         │  URL만 공유     │  워크스페이스   │
│ 복잡한 시나리오 │      △          │       O         │
└─────────────────┴─────────────────┴─────────────────┘
```

### 1.4 클라이언트 코드 자동 생성

OpenAPI 스펙(JSON/YAML)을 기반으로 **API 클라이언트 코드를 자동 생성**할 수 있습니다.

```bash
# OpenAPI Generator 사용 예시
openapi-generator generate -i http://localhost:8080/v3/api-docs -g typescript-axios -o ./src/api/generated
```

생성되는 코드:
```typescript
// 자동 생성된 API 클라이언트
export class AuthApi {
  signup(request: SignupRequest): Promise<SignupResponse> { ... }
  login(request: LoginRequest): Promise<LoginResponse> { ... }
  // ...
}
```

### 1.5 실제 개발 흐름

```
1. 백엔드: 회원가입 API 구현
   └─ @PostMapping("/api/v1/auth/signup")

2. Swagger UI 자동 업데이트
   └─ http://localhost:8080/swagger-ui.html

3. 프론트엔드: Swagger 보고 API 호출 방법 파악
   └─ Request Body, Response 형식 확인

4. 프론트엔드: Swagger에서 직접 테스트
   └─ Try it out → Execute

5. 프론트엔드: 실제 코드 작성
   └─ axios.post('/api/v1/auth/signup', { ... })
```

### 1.6 OpenAPI vs Swagger 용어 정리

| 용어 | 설명 |
|------|------|
| **OpenAPI** | API 명세를 기술하는 표준 스펙 (버전: 3.0, 3.1) |
| **Swagger** | OpenAPI 도구 모음 (Swagger UI, Swagger Editor 등) |
| **SpringDoc** | Spring Boot에서 OpenAPI 문서를 생성하는 라이브러리 |
| **Swagger UI** | OpenAPI 스펙을 시각화하는 웹 UI |

```
역사:
Swagger 2.0 → OpenAPI 3.0으로 명칭 변경 (2017년)
현재는 "OpenAPI"가 공식 명칭이지만, "Swagger"도 혼용됨
```

---

## 2. 개요

SpringDoc OpenAPI를 사용하여 API 문서를 자동 생성하는 설정입니다.

- **접속 URL:** http://localhost:8080/swagger-ui.html
- **공식 문서:** https://springdoc.org/

---

## 2. 전체 구조

```java
@Bean
public OpenAPI openAPI() {
    String securitySchemeName = "bearerAuth";

    return new OpenAPI()
            .info(...)           // 1. API 기본 정보
            .addSecurityItem(...) // 2. 전역 보안 요구사항
            .components(...);     // 3. 보안 스키마 정의
}
```

---

## 3. 각 설정 상세 설명

### 3.1 info() - API 문서 기본 정보

```java
.info(new Info()
        .title("AI Interview Simulator API")      // Swagger UI 상단 제목
        .description("AI 기술 면접 시뮬레이터 API 문서") // 설명
        .version("v1.0.0")                        // API 버전
        .contact(new Contact()                    // 연락처 정보
                .name("Interview AI Team")
                .email("support@interviewai.com")))
```

**Swagger UI에서 표시:**
```
┌─────────────────────────────────────────┐
│ AI Interview Simulator API    v1.0.0   │
│ AI 기술 면접 시뮬레이터 API 문서          │
│ Contact: Interview AI Team              │
└─────────────────────────────────────────┘
```

---

### 3.2 addSecurityItem() - 전역 보안 요구사항

```java
.addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
```

**역할:**
- 모든 API 엔드포인트에 "이 보안 스키마가 필요하다"고 선언
- `securitySchemeName` = "bearerAuth"를 참조
- Swagger UI의 모든 API에 자물쇠 아이콘이 표시됨

---

### 3.3 components() - 보안 스키마 정의

```java
.components(new Components()
        .addSecuritySchemes(securitySchemeName,
                new SecurityScheme()
                        .name(securitySchemeName)           // 스키마 이름
                        .type(SecurityScheme.Type.HTTP)     // HTTP 인증 방식
                        .scheme("bearer")                   // Bearer 토큰 사용
                        .bearerFormat("JWT")                // 토큰 형식: JWT
                        .description("JWT 토큰을 입력하세요. (Bearer 제외)")))
```

**각 설정의 의미:**

| 설정 | 값 | 설명 |
|------|-----|------|
| `type` | `HTTP` | HTTP 인증 헤더 사용 (vs API_KEY, OAUTH2 등) |
| `scheme` | `bearer` | `Authorization: Bearer <token>` 형식 |
| `bearerFormat` | `JWT` | 토큰이 JWT 형식임을 명시 (문서용) |

---

## 4. SecurityScheme.Type 종류

| Type | 설명 | 사용 예시 |
|------|------|----------|
| `HTTP` | HTTP 인증 헤더 사용 | Bearer 토큰, Basic 인증 |
| `API_KEY` | API 키 방식 | `X-API-Key: abc123` 헤더 |
| `OAUTH2` | OAuth 2.0 플로우 | Google, Kakao 소셜 로그인 |
| `OPENID_CONNECT` | OpenID Connect | SSO 인증 |

현재 프로젝트에서는 **JWT Bearer 토큰**을 사용하므로 `HTTP` + `bearer` 조합이 적합합니다.

---

## 5. Swagger UI에서의 동작

### 5.1 인증 흐름

1. **Authorize 버튼** 클릭
2. **토큰 입력** (Bearer 접두사 없이 토큰만 입력)
3. **API 호출 시** 자동으로 헤더에 추가:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
   ```

### 5.2 실제 API 호출 시 흐름

```
1. 로그인 API 호출 → JWT 토큰 발급
   POST /api/v1/auth/login
   Response: { "accessToken": "eyJhbG..." }

2. Swagger UI에서 [Authorize] 클릭
   → 토큰 입력: eyJhbG...

3. 보호된 API 호출 시 자동으로 헤더 추가
   GET /api/v1/auth/me
   Header: Authorization: Bearer eyJhbG...
```

---

## 6. 전체 코드 (주석 포함)

```java
package com.interviewai.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger/OpenAPI 문서화 설정
 *
 * SpringDoc OpenAPI를 사용하여 API 문서를 자동 생성합니다.
 * 접속 URL: http://localhost:8080/swagger-ui.html
 */
@Configuration
public class SwaggerConfig {

    /**
     * OpenAPI 설정 Bean
     *
     * 구성 요소:
     * 1. info() - API 기본 정보 (제목, 설명, 버전, 연락처)
     * 2. addSecurityItem() - 전역 보안 요구사항 (모든 API에 인증 필요 표시)
     * 3. components() - 보안 스키마 정의 (JWT Bearer 토큰 방식)
     *
     * Swagger UI 사용법:
     * 1. [Authorize] 버튼 클릭
     * 2. JWT 토큰 입력 (Bearer 접두사 없이 토큰만 입력)
     * 3. API 호출 시 자동으로 Authorization 헤더에 추가됨
     */
    @Bean
    public OpenAPI openAPI() {
        // 보안 스키마 이름 (components와 securityItem에서 동일하게 참조)
        String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                // 1. API 기본 정보 설정
                .info(new Info()
                        .title("AI Interview Simulator API")
                        .description("AI 기술 면접 시뮬레이터 API 문서")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Interview AI Team")
                                .email("support@interviewai.com")))

                // 2. 전역 보안 요구사항
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))

                // 3. 보안 스키마 정의 (JWT Bearer 토큰)
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT 토큰을 입력하세요. (Bearer 제외)")));
    }
}
```

---

## 7. 참고 자료

- [SpringDoc 공식 문서](https://springdoc.org/)
- [OpenAPI 3.0 스펙](https://swagger.io/specification/)
- [Swagger UI 데모](https://petstore.swagger.io/)

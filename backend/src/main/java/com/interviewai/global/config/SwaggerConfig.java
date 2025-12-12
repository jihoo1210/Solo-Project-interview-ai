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
 *
 * @see <a href="https://springdoc.org/">SpringDoc 공식 문서</a>
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
     *    → "Authorization: Bearer {입력한 토큰}"
     */
    @Bean
    public OpenAPI openAPI() {
        // 보안 스키마 이름 (components와 securityItem에서 동일하게 참조)
        String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                // ═══════════════════════════════════════════════════════════
                // 1. API 기본 정보 설정
                // Swagger UI 상단에 표시되는 API 문서 메타 정보
                // ═══════════════════════════════════════════════════════════
                .info(new Info()
                        .title("AI Interview Simulator API")      // API 제목
                        .description("AI 기술 면접 시뮬레이터 API 문서") // API 설명
                        .version("v1.0.0")                        // API 버전
                        .contact(new Contact()                    // 담당자 연락처
                                .name("Interview AI Team")
                                .email("support@interviewai.com")))

                // ═══════════════════════════════════════════════════════════
                // 2. 전역 보안 요구사항
                // 모든 API 엔드포인트에 이 보안 스키마가 필요함을 선언
                // → Swagger UI에서 모든 API에 자물쇠 아이콘 표시
                // ═══════════════════════════════════════════════════════════
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))

                // ═══════════════════════════════════════════════════════════
                // 3. 보안 스키마 정의 (JWT Bearer 토큰)
                // 실제 인증 방식을 정의하는 부분
                // ═══════════════════════════════════════════════════════════
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        // HTTP 인증 방식 사용 (vs API_KEY, OAUTH2, OPENID_CONNECT)
                                        .type(SecurityScheme.Type.HTTP)
                                        // Bearer 토큰 스키마 사용 (Authorization: Bearer xxx)
                                        .scheme("bearer")
                                        // 토큰 형식이 JWT임을 명시 (문서화 목적)
                                        .bearerFormat("JWT")
                                        // Swagger UI에서 토큰 입력 시 표시되는 안내 문구
                                        .description("JWT 토큰을 입력하세요. (Bearer 제외)")));
    }
}

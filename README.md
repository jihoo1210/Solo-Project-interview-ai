# InterBit - AI 면접 코칭 서비스

<div align="center">

![InterBit Logo](https://img.shields.io/badge/InterBit-AI%20Interview%20Coach-F59E0B?style=for-the-badge&logo=robot&logoColor=white)

**AI 기반 기술 면접 시뮬레이터로 실전 면접을 준비하세요**

[![Live Demo](https://img.shields.io/badge/Live-interbit.p--e.kr-4CAF50?style=flat-square&logo=vercel)](https://interbit.p-e.kr)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.8-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev)

</div>

---

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시스템 아키텍처](#시스템-아키텍처)
- [프로젝트 구조](#프로젝트-구조)
- [개발 진행 과정](#개발-진행-과정)
- [트러블슈팅](#트러블슈팅)
- [API 문서](#api-문서)
- [실행 방법](#실행-방법)
- [배포](#배포)

---

## 프로젝트 소개

**InterBit**은 AI를 활용한 기술 면접 시뮬레이터입니다. Google Gemini AI가 실제 면접관처럼 질문을 생성하고, 사용자의 답변을 평가하며 상세한 피드백을 제공합니다.

### 왜 InterBit인가?

- **실전 같은 면접 경험**: AI가 난이도와 직무에 맞는 질문을 동적으로 생성
- **즉각적인 피드백**: 답변 직후 점수, 피드백, 모범 답안 제공
- **성장 추적**: 대시보드에서 면접 성적 추이와 강약점 분석
- **무료로 시작**: 하루 3회 무료 면접, Premium 구독으로 무제한 이용

---

## 주요 기능

### 1. AI 면접 시뮬레이션
- **직무별 맞춤 질문**: Frontend, Backend, Fullstack, 기타(DevOps, Data 등)
- **난이도 선택**: Junior, Mid-level, Senior
- **실시간 AI 평가**: Google Gemini 2.0 Flash 모델 활용
- **상세 피드백**: 점수(1-10), 피드백, 모범 답안 제공

### 2. 인증 시스템
- **이메일 회원가입**: 이메일 인증 필수
- **소셜 로그인**: Google, Naver OAuth 2.0
- **JWT 인증**: Access Token + Refresh Token
- **비밀번호 재설정**: 이메일 링크 방식

### 3. 대시보드
- **면접 기록**: 전체 면접 이력 조회
- **성적 추이**: 점수 변화 그래프
- **카테고리별 분석**: 직무/난이도별 평균 점수

### 4. Premium 기능
- **무제한 면접**: 일일 제한 해제
- **질문 개수 설정**: 3~10개 선택
- **꼬리질문**: AI 추가 질문 기능
- **세부 카테고리**: 직무별 상세 토픽 선택

### 5. 결제 시스템
- **토스페이먼츠 연동**: 카드 결제, 간편결제
- **정기 구독**: 월간/연간 플랜
- **자동 갱신**: 구독 자동 연장

---

## 기술 스택

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Java | 17 | 프로그래밍 언어 |
| Spring Boot | 3.5.8 | 웹 프레임워크 |
| Spring Security | 6.x | 인증/인가 |
| Spring Data JPA | 3.x | ORM |
| Spring AI | 1.1.2 | AI 모델 연동 |
| MariaDB | 10.x | 운영 DB |
| H2 | 2.x | 개발/테스트 DB |
| Redis | 7.x | 토큰 저장소, 캐시 |
| JWT (jjwt) | 0.12.6 | 토큰 인증 |

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.1 | UI 라이브러리 |
| TypeScript | 5.8 | 타입 안전성 |
| Vite | 7.2 | 빌드 도구 |
| TailwindCSS | 4.1 | 스타일링 |
| React Router | 7.6 | 라우팅 |
| Axios | 1.9 | HTTP 클라이언트 |
| Recharts | 2.15 | 차트 라이브러리 |
| Three.js | 0.177 | 3D 그래픽 |

### AI & External Services
| 서비스 | 용도 |
|--------|------|
| Google Gemini 2.0 Flash | AI 질문 생성 및 답변 평가 |
| Google OAuth 2.0 | 소셜 로그인 |
| Naver OAuth 2.0 | 소셜 로그인 |
| 토스페이먼츠 | 결제 처리 |
| Gmail SMTP | 이메일 발송 |

### Infrastructure
| 서비스 | 용도 |
|--------|------|
| AWS Elastic Beanstalk | Backend 배포 |
| AWS S3 | Frontend 정적 호스팅 |
| AWS CloudFront | CDN |
| AWS ElastiCache (Redis) | 세션/토큰 저장 |
| AWS RDS (MariaDB) | 데이터베이스 |
| GitHub Actions | CI/CD |

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS CloudFront (CDN)                          │
│                    https://interbit.p-e.kr                       │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│     AWS S3 Bucket        │    │   AWS Elastic Beanstalk          │
│   (React Frontend)       │    │     (Spring Boot API)            │
│   - Static Files         │    │     - REST API                   │
│   - SPA Routing          │    │     - JWT Auth                   │
└──────────────────────────┘    │     - Business Logic             │
                                └──────────────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
          ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
          │  AWS RDS        │   │ AWS ElastiCache │   │  Google Gemini  │
          │  (MariaDB)      │   │    (Redis)      │   │      API        │
          │  - User Data    │   │  - JWT Tokens   │   │  - AI Questions │
          │  - Interviews   │   │  - Email Tokens │   │  - Evaluation   │
          │  - Payments     │   │  - Cache        │   │  - Feedback     │
          └─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## 프로젝트 구조

```
Solo-Project-interview-ai/
├── backend/
│   ├── src/main/java/com/interviewai/
│   │   ├── domain/
│   │   │   ├── user/           # 사용자, 인증
│   │   │   ├── interview/      # 면접 시뮬레이션
│   │   │   ├── dashboard/      # 대시보드, 통계
│   │   │   └── payment/        # 결제, 구독
│   │   ├── global/
│   │   │   ├── config/         # Security, Swagger, AI 설정
│   │   │   ├── exception/      # 예외 처리
│   │   │   └── common/         # 공통 응답 형식
│   │   └── infra/
│   │       ├── redis/          # Redis Repository
│   │       └── mail/           # 이메일 서비스
│   └── src/main/resources/
│       └── application.yml     # 환경 설정
│
├── frontend/
│   ├── src/
│   │   ├── api/                # API 클라이언트
│   │   ├── components/         # 재사용 컴포넌트
│   │   ├── pages/              # 페이지 컴포넌트
│   │   │   ├── auth/           # 로그인, 회원가입
│   │   │   ├── interview/      # 면접 관련 페이지
│   │   │   └── payment/        # 결제 페이지
│   │   ├── hooks/              # Custom Hooks
│   │   ├── store/              # 전역 상태 (AuthContext)
│   │   └── types/              # TypeScript 타입
│   └── index.html
│
├── docs/
│   ├── [Phase1_프로젝트셋업]_구현서_v1.0.md
│   ├── [Phase2_인증시스템]_구현서_v1.0.md
│   ├── [Phase3_면접시뮬레이션]_구현서_v1.0.md
│   ├── [Phase4_대시보드]_구현서_v1.0.md
│   ├── [Phase5_프리미엄기능]_구현서_v1.0.md
│   ├── [Phase6_결제시스템]_구현서_v1.0.md
│   └── 학습노트/               # 개발 중 학습 기록
│
└── .github/workflows/
    └── deploy.yml              # CI/CD 파이프라인
```

---

## 개발 진행 과정

### Phase 1: 프로젝트 셋업 (완료)
- Spring Boot + React 프로젝트 초기 설정
- Swagger UI 연동
- 공통 응답 형식 및 예외 처리 구조화
- Axios 인터셉터 설정

### Phase 2: 인증 시스템 (완료)
- JWT 기반 인증 (Access + Refresh Token)
- 이메일 회원가입 및 인증
- 비밀번호 재설정
- Google/Naver OAuth 2.0 연동
- Redis 토큰 저장소

### Phase 3: 면접 시뮬레이션 (완료)
- Google Gemini AI 연동
- 면접 질문 생성 (직무/난이도별)
- 답변 평가 및 피드백
- 면접 기록 저장 및 조회
- 면접 계속하기 기능
- FREE 사용자 일일 제한 (3회/일)

### Phase 4: 대시보드 (완료)
- 면접 기록 목록/상세 조회
- 점수 추이 차트 (Recharts)
- 카테고리별 평균 점수 분석

### Phase 5: Premium 기능 (완료)
- 무제한 면접
- 질문 개수 설정 (3~10개)
- 꼬리질문 기능
- 세부 카테고리 선택

### Phase 6: 결제 시스템 (완료)
- 토스페이먼츠 연동
- 정기 구독 (월간/연간)
- 구독 관리 (일시정지, 재개, 해지)
- 결제 내역 조회

---

## 트러블슈팅

### 1. Spring AI Google GenAI project-id 오류

**문제**: 배포 환경에서 `Google GenAI project-id must be set!` 오류 발생

**원인**:
- 로컬에서는 Google SDK fallback으로 project-id 없이 작동
- Elastic Beanstalk에는 Google SDK가 없어 fallback 불가

**해결**:
```yaml
# application.yml (prod)
spring:
  ai:
    google:
      genai:
        api-key: ${GOOGLE_AI_API_KEY}
        project-id: ${GOOGLE_AI_PROJECT_ID:gen-lang-client-0514433569}
```

> 상세 내용: [docs/학습노트/배포/01_Spring_AI_Google_GenAI_project-id_오류_해결.md](docs/학습노트/배포/01_Spring_AI_Google_GenAI_project-id_오류_해결.md)

### 2. 이메일 URL 하드코딩 문제

**문제**: 이메일 인증 링크가 `localhost:8080`으로 고정

**해결**:
- `EmailType`에서 URL 경로만 유지
- `EmailService`에서 `app.backend-url`, `app.frontend-url` 설정 읽어서 동적 생성

```java
// EmailService.java
@Value("${app.backend-url:http://localhost:8080}")
private String backendUrl;

@Value("${app.frontend-url:http://localhost:5173}")
private String frontendUrl;
```

### 3. OAuth Redirect URI 불일치

**문제**: 배포 후 OAuth 로그인 시 redirect_uri 불일치 오류

**해결**:
- Google/Naver OAuth 콘솔에서 `https://interbit.p-e.kr/oauth/callback/*` 등록
- `application.yml` prod 프로필에 배포 URL 설정

### 4. Redis 연결 실패 (배포)

**문제**: Elastic Beanstalk에서 Redis 연결 실패

**원인**: ElastiCache 보안 그룹에서 EB 인스턴스 인바운드 미허용

**해결**:
- ElastiCache 보안 그룹 → 인바운드 규칙 추가
- Source: EB 인스턴스 보안 그룹
- Port: 6379

---

## API 문서

### Swagger UI
- 로컬: http://localhost:8080/swagger-ui.html
- 운영: https://interbit.p-e.kr/swagger-ui.html

### 주요 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| **인증** |||
| POST | `/api/v1/auth/register` | 회원가입 |
| POST | `/api/v1/auth/login` | 로그인 |
| POST | `/api/v1/auth/refresh` | 토큰 갱신 |
| POST | `/api/v1/auth/oauth/google` | Google 로그인 |
| POST | `/api/v1/auth/oauth/naver` | Naver 로그인 |
| **면접** |||
| POST | `/api/v1/interviews/start` | 면접 시작 |
| POST | `/api/v1/interviews/{id}/answer` | 답변 제출 |
| POST | `/api/v1/interviews/{id}/end` | 면접 종료 |
| GET | `/api/v1/interviews` | 면접 기록 목록 |
| GET | `/api/v1/interviews/{id}` | 면접 상세 조회 |
| **대시보드** |||
| GET | `/api/v1/dashboard/summary` | 대시보드 요약 |
| GET | `/api/v1/dashboard/score-trend` | 점수 추이 |
| **결제** |||
| POST | `/api/v1/payments/subscription` | 구독 시작 |
| POST | `/api/v1/payments/confirm` | 결제 승인 |
| GET | `/api/v1/subscriptions/current` | 현재 구독 조회 |

---

## 실행 방법

### 사전 요구사항
- Java 17+
- Node.js 20+
- Redis 7+
- MariaDB 10+ (또는 H2 for local)

### Backend

```bash
cd backend

# 환경변수 설정 (.env 파일 생성)
GOOGLE_AI_API_KEY=your-gemini-api-key
JWT_SECRET=your-jwt-secret-at-least-32-characters
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# 실행
./gradlew bootRun
```

### Frontend

```bash
cd frontend

# 환경변수 설정 (.env 파일 생성)
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_NAVER_CLIENT_ID=your-naver-client-id

# 의존성 설치 및 실행
npm install
npm run dev
```

### 접속
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console

---

## 배포

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
- Frontend: S3 + CloudFront
- Backend: Elastic Beanstalk
```

**트리거**: `main` 브랜치 push 시 자동 배포

### 환경변수 (Elastic Beanstalk)

| 변수명 | 설명 |
|--------|------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_HOST` | RDS 엔드포인트 |
| `DB_USERNAME` | DB 사용자명 |
| `DB_PASSWORD` | DB 비밀번호 |
| `REDIS_HOST` | ElastiCache 엔드포인트 |
| `GOOGLE_AI_API_KEY` | Gemini API 키 |
| `JWT_SECRET` | JWT 시크릿 |
| `MAIL_USERNAME` | Gmail 주소 |
| `MAIL_PASSWORD` | Gmail 앱 비밀번호 |

---

## 라이선스

This project is for portfolio purposes.

---

<div align="center">

**Made with by [Jihoo](https://github.com/jihoo1210)**

</div>

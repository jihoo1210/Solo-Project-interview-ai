# [Phase 3] 면접 시뮬레이션 구현서 v1.0

> 작성일: 2024-12-16
> 버전: 3.1 (Task 1~12 완료 + 추가 기능 구현 + 합격/불합격 기능 제거)
> 최종 수정일: 2025-12-17
> 작성자: AI Interview Simulator Team

---

## 1. 개요

Phase 3에서는 AI 기술 면접 시뮬레이터의 핵심 기능인 면접 시뮬레이션을 구현합니다. Claude API를 활용하여 면접 질문을 생성하고, 사용자의 답변을 평가하며, 면접 기록을 저장합니다.

---

## 2. 주요 기능

### 2.1 면접 세션 관리
- 면접 시작/종료
- 면접 유형 선택 (프론트엔드, 백엔드, 풀스택 등)
- 난이도 설정 (주니어, 미드, 시니어)

### 2.2 AI 질문 생성
- Claude API를 활용한 맞춤형 면접 질문 생성
- 이전 답변을 기반으로 후속 질문 생성
- 기술 스택별 질문 커스터마이징

### 2.3 답변 평가
- AI 기반 답변 분석 및 피드백
- 점수 산정 (기술 정확도, 설명력, 구조화 등)
- 개선점 및 모범 답안 제시

### 2.4 면접 기록
- 면접 이력 저장
- 질문/답변 히스토리 조회
- 통계 및 성장 추이 분석

---

## 3. 기술 스택

### 3.1 Backend
- Spring Boot 3.4.x
- Spring AI (Claude API 연동)
- JPA/Hibernate
- Redis (세션 캐싱)

### 3.2 Frontend
- React 18 + TypeScript
- Tailwind CSS v4
- Zustand (상태 관리)
- React Query (서버 상태 관리)

---

## 4. Task 목록

### Backend

- [x] Task 1: 면접 관련 엔티티 설계 (Interview, Question, Answer)
- [x] Task 2: 면접 Repository 및 Service 기본 구조
- [x] Task 3: Claude API 연동 설정 (Spring AI)
- [x] Task 4: 면접 질문 생성 Service
- [x] Task 5: 답변 평가 Service
- [x] Task 6: 면접 Controller (REST API)
- [x] Task 7: 면접 기록 조회 API

### Frontend

- [x] Task 8: 면접 시작 페이지 (유형/난이도 선택)
- [x] Task 9: 면접 진행 페이지 (질문/답변 UI)
- [x] Task 10: 답변 평가 결과 페이지
- [x] Task 11: 면접 기록 목록 페이지
- [x] Task 12: 면접 상세 조회 페이지

### 추가 구현

- [x] FREE 사용자 일일 면접 제한 (3회/일)
- [x] 홈페이지 오늘 면접 횟수 표시
- [x] 면접 시작 페이지 제한 안내 UI
- [x] 면접 계속하기 (Resume Interview) 기능
- [x] 중간 평가 화면 제거 (답변 후 바로 다음 질문으로 이동)
- [x] OTHER 면접 유형 카테고리 추가 (GeminiService)
- [x] 합격/불합격 기능 제거 (점수만 표시)

---

## 5. 데이터베이스 설계

### 5.1 ERD 개요

```
User (1) ──────< Interview (N)
                    │
                    │ (1)
                    ▼
              Question (N)
                    │
                    │ (1)
                    ▼
               Answer (1)
```

### 5.2 테이블 정의

#### interviews 테이블
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | BIGINT | PK |
| user_id | BIGINT | FK → users |
| type | VARCHAR | 면접 유형 (FRONTEND, BACKEND, FULLSTACK, OTHER 등) |
| custom_type | VARCHAR | 기타 유형명 (type이 OTHER일 때) |
| difficulty | VARCHAR | 난이도 (JUNIOR, MID, SENIOR) |
| status | VARCHAR | 상태 (IN_PROGRESS, COMPLETED, CANCELLED) |
| total_score | INT | 총점 (0-10) |
| started_at | DATETIME | 시작 시간 |
| ended_at | DATETIME | 종료 시간 |
| created_at | DATETIME | 생성일 |
| updated_at | DATETIME | 수정일 |

#### questions 테이블
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | BIGINT | PK |
| interview_id | BIGINT | FK → interviews |
| content | TEXT | 질문 내용 |
| order_number | INT | 질문 순서 |
| category | VARCHAR | 질문 카테고리 |
| created_at | DATETIME | 생성일 |

#### answers 테이블
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | BIGINT | PK |
| question_id | BIGINT | FK → questions |
| content | TEXT | 답변 내용 |
| score | INT | 점수 (0-10) |
| feedback | TEXT | AI 피드백 |
| model_answer | TEXT | 모범 답안 |
| answer_time_seconds | INT | 답변 소요 시간 (초) |
| created_at | DATETIME | 생성일 |

---

## 6. API 설계

### 6.1 면접 시작
```
POST /api/v1/interviews
Request:
{
  "type": "BACKEND",
  "difficulty": "JUNIOR"
}

Response:
{
  "success": true,
  "data": {
    "interviewId": 1,
    "type": "BACKEND",
    "difficulty": "JUNIOR",
    "firstQuestion": {
      "id": 1,
      "content": "Spring Boot에서 의존성 주입(DI)이란 무엇인가요?",
      "orderNumber": 1
    }
  }
}
```

### 6.2 답변 제출 및 다음 질문
```
POST /api/v1/interviews/{interviewId}/answers
Request:
{
  "questionId": 1,
  "content": "의존성 주입은..."
}

Response:
{
  "success": true,
  "data": {
    "evaluation": {
      "score": 85,
      "feedback": "핵심 개념을 잘 설명했습니다...",
      "modelAnswer": "의존성 주입(DI)은..."
    },
    "nextQuestion": {
      "id": 2,
      "content": "그렇다면 IoC 컨테이너는 무엇인가요?",
      "orderNumber": 2
    }
  }
}
```

### 6.3 면접 종료
```
POST /api/v1/interviews/{interviewId}/end

Response:
{
  "success": true,
  "data": {
    "interviewId": 1,
    "totalScore": 82,
    "questionCount": 5,
    "summary": "전반적으로 좋은 성과입니다..."
  }
}
```

### 6.4 면접 기록 조회
```
GET /api/v1/interviews?page=0&size=10

Response:
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "type": "BACKEND",
        "difficulty": "JUNIOR",
        "totalScore": 82,
        "questionCount": 5,
        "createdAt": "2024-12-16T10:00:00"
      }
    ],
    "totalPages": 1,
    "totalElements": 1
  }
}
```

### 6.5 면접 상세 조회
```
GET /api/v1/interviews/{interviewId}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "type": "BACKEND",
    "difficulty": "JUNIOR",
    "totalScore": 82,
    "questions": [
      {
        "id": 1,
        "content": "Spring Boot에서 의존성 주입이란?",
        "answer": {
          "content": "의존성 주입은...",
          "score": 85,
          "feedback": "..."
        }
      }
    ]
  }
}
```

### 6.6 면접 계속하기
```
POST /api/v1/interviews/{interviewId}/resume

Response:
{
  "success": true,
  "data": {
    "interviewId": 1,
    "type": "BACKEND",
    "difficulty": "JUNIOR",
    "currentQuestion": {
      "id": 3,
      "content": "Spring Security에서 JWT 인증 흐름을 설명해주세요.",
      "orderNumber": 3
    },
    "answeredCount": 2
  }
}
```

---

## 7. Claude API 연동

### 7.1 Spring AI 설정

```yaml
# application.yml
spring:
  ai:
    anthropic:
      api-key: ${ANTHROPIC_API_KEY}
      chat:
        options:
          model: claude-3-5-sonnet-20241022
          max-tokens: 4096
          temperature: 0.7
```

### 7.2 프롬프트 설계

#### 질문 생성 프롬프트
```
당신은 기술 면접관입니다.
면접 유형: {type}
난이도: {difficulty}
이전 질문/답변: {history}

다음 면접 질문을 1개 생성해주세요.
- 실무와 관련된 구체적인 질문
- 난이도에 맞는 깊이
- 이전 답변을 고려한 후속 질문 가능
```

#### 답변 평가 프롬프트
```
당신은 기술 면접 평가자입니다.
질문: {question}
답변: {answer}

다음 형식으로 평가해주세요:
1. 점수 (0-100)
2. 피드백 (잘한 점, 개선점)
3. 모범 답안
```

---

## 8. 진행 상태

### 8.1 완료된 작업

#### Backend (Task 1~7)
- [x] Interview, Question, Answer 엔티티 설계
- [x] InterviewRepository, QuestionRepository, AnswerRepository 구현
- [x] InterviewService 구현 (면접 시작, 답변 제출, 면접 종료)
- [x] AiService 구현 (Claude API 연동, 질문 생성, 답변 평가)
- [x] InterviewController REST API 구현
- [x] FREE 사용자 일일 면접 제한 로직 (User 엔티티에 추가)

#### Frontend (Task 8~12)
- [x] InterviewStartPage - 유형/난이도 선택, FREE 사용자 제한 UI
- [x] InterviewPage - 질문/답변 진행 UI
- [x] InterviewResultPage - 면접 결과 및 종합 피드백
- [x] InterviewListPage - 면접 기록 목록 (페이지네이션)
- [x] InterviewDetailPage - 면접 상세 조회

#### 추가 개선사항
- [x] 홈페이지 오늘 면접 횟수 표시 (FREE: X/3회)
- [x] 면접 시작 페이지 일일 제한 안내 배너
- [x] 제한 초과 시 버튼 비활성화 및 안내 메시지
- [x] 3D 캐릭터 (토끼가 행성 위에서 점프)
- [x] Duolingo 스타일 따뜻한 디자인
- [x] 면접 계속하기 API (POST /api/interviews/{id}/resume)
- [x] InterviewDetailPage에서 IN_PROGRESS 상태일 때 "면접 계속하기" 버튼 표시
- [x] 중간 평가 화면 제거 - 답변 제출 후 바로 다음 질문으로 이동
- [x] 질문별 타이머 기능 (자동 리셋)
- [x] 합격/불합격 기능 제거 - 점수만 표시하도록 변경

### 8.2 삭제된 기능

#### 합격/불합격 판단 기능 제거 (2025-12-17)

면접 시뮬레이터의 목적은 학습과 연습이므로, 합격/불합격 판단 기능을 제거했습니다.

**제거된 항목:**
- `Interview.passed` 필드
- `InterviewService.determinePassed()` 메서드
- `InterviewEndResponse.passed`, `InterviewDetailResponse.passed` 필드
- Frontend `InterviewResultPage` 합격/불합격 배너 UI

**변경 이유:**
- 면접 연습의 본질은 학습과 개선이지 합격/불합격 판정이 아님
- 점수와 피드백만으로 충분한 학습 효과 제공
- 불필요한 심리적 압박 제거

---

## 9. 다음 단계

### 9.1 Phase 4: 대시보드 및 통계
- 면접 성적 추이 차트
- 카테고리별 강약점 분석
- 학습 추천 기능

### 9.2 Phase 5: Premium 기능
- 면접 질문 갯수 설정 (3~10개)
- 꼬리질문 기능
- 무제한 면접 (일일 제한 해제)
- 면접 유형별 세부 카테고리 선택 기능

### 9.3 Phase 6: 결제 시스템
- Payment 엔티티/Repository
- PG사 연동 (토스페이먼츠/카카오페이)
- 구독 관리 API

### 9.4 Phase 7: 배포 및 최적화
- Docker 컨테이너화
- CI/CD 파이프라인 구축
- 성능 최적화

---

## 10. Phase 3 완료 체크리스트

- [x] 면접 시작/진행/종료 API (Backend)
- [x] AI 질문 생성 및 답변 평가 (GeminiService)
- [x] 면접 기록 목록/상세 조회 API
- [x] 면접 시작 페이지 (Frontend)
- [x] 면접 진행 페이지 (질문/답변 UI)
- [x] 면접 결과 페이지 (레이더 차트, 상세 피드백)
- [x] 면접 기록 목록/상세 페이지
- [x] FREE 사용자 일일 면접 제한 (3회)
- [x] 면접 계속하기 기능
- [x] 빌드 테스트 통과 (Backend & Frontend)

**Phase 3 완료! → Phase 4 진행**

# [Phase 5] Premium 기능 구현서 v1.0

> 작성일: 2025-12-17
> 버전: 1.0 (구현 완료)
> 작성자: AI Interview Simulator Team

---

## 1. 개요

Phase 5에서는 FREE/PREMIUM 구독 모델을 기반으로 한 Premium 전용 기능을 구현합니다. Premium 사용자에게 질문 개수 설정, 꼬리질문 기능, 무제한 면접 등의 혜택을 제공합니다.

---

## 2. 구독 모델

### 2.1 FREE 사용자
- 일일 면접 횟수: **3회 제한**
- 질문 개수: **5개 고정**
- 꼬리질문: **비활성화** (항상 새로운 주제로 질문)

### 2.2 PREMIUM 사용자
- 일일 면접 횟수: **무제한**
- 질문 개수: **3, 5, 7, 10개 선택 가능**
- 꼬리질문: **활성화 가능** (이전 답변 기반 심화 질문)

---

## 3. 주요 기능

### 3.1 질문 개수 설정
- 면접 시작 시 질문 개수 선택 (3, 5, 7, 10개)
- Interview 엔티티에 `questionLimit` 필드 저장
- FREE 사용자는 5개 고정, UI 비활성화

### 3.2 꼬리질문 기능
- `followUpEnabled` 플래그로 활성화/비활성화
- 활성화 시: 이전 답변을 분석하여 심화 질문 생성
- 비활성화 시: 이전 주제를 피하고 새로운 영역에서 질문

### 3.3 일일 면접 횟수 제한
- FREE 사용자: 일일 3회 제한
- PREMIUM 사용자: 무제한
- 매일 자정(00:00) 횟수 초기화 (스케줄러)

### 3.4 Premium 업그레이드 UI
- 마이페이지에 구독 플랜 카드 추가
- 현재 플랜 표시 및 Premium 혜택 안내
- 업그레이드 버튼 (결제 시스템 준비 중)

---

## 4. 기술 스택

### 4.1 Backend
- Spring Boot 3.4.x
- Spring Scheduling (`@EnableScheduling`, `@Scheduled`)
- JPA `@Modifying` 벌크 업데이트

### 4.2 Frontend
- React 18 + TypeScript
- Tailwind CSS v4
- Zustand (사용자 상태 관리)

---

## 5. Task 목록

### Backend

- [x] Task 1: Interview 엔티티에 `questionLimit`, `followUpEnabled` 필드 추가
- [x] Task 2: InterviewService 면접 시작 시 Premium 검증
- [x] Task 3: GeminiService 꼬리질문 프롬프트 분리
- [x] Task 5: DailyResetScheduler 구현 (매일 자정 횟수 초기화)
- [x] Task 5-1: UserRepository 벌크 업데이트 쿼리 추가
- [x] Task 5-2: `@EnableScheduling` 활성화

### Frontend

- [x] Task 2-F: InterviewStartPage에 질문 개수/꼬리질문 UI 추가
- [x] Task 4: types/index.ts에 `questionLimit`, `followUpEnabled` 추가
- [x] Task 6: MyPage에 Premium 구독 카드 추가

### 공통

- [x] Task 7: 빌드 테스트 및 문서 작성

---

## 6. 데이터베이스 설계

### 6.1 Interview 테이블 수정

| 컬럼명 | 타입 | 기본값 | 설명 |
|--------|------|--------|------|
| question_limit | INTEGER | 5 | 질문 개수 제한 |
| follow_up_enabled | BOOLEAN | false | 꼬리질문 활성화 여부 |

### 6.2 User 테이블 (기존)

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| subscription_type | VARCHAR | FREE / PREMIUM |
| subscription_expires_at | TIMESTAMP | Premium 만료일 |
| daily_interview_count | INTEGER | 오늘 면접 횟수 |
| last_interview_date | DATE | 마지막 면접 날짜 |

---

## 7. API 설계

### 7.1 면접 시작 (수정)

```
POST /api/interviews

Request:
{
  "type": "BACKEND",
  "difficulty": "MID",
  "customType": null,
  "questionLimit": 5,      // 추가
  "followUpEnabled": false // 추가
}

Response:
{
  "success": true,
  "data": {
    "interviewId": 1,
    "type": "BACKEND",
    "difficulty": "MID",
    "firstQuestion": { ... }
  }
}
```

### 7.2 Premium 검증 로직

```java
// InterviewService.startInterview()
if (user.getSubscriptionType() == SubscriptionType.FREE) {
    user.increaseAndCheckInterviewCount();  // 3회 초과 시 예외
    if (request.getQuestionLimit() != 5 || request.isFollowUpEnabled()) {
        throw new CustomException(ErrorCode.PREMIUM_REQUIRED);
    }
}
```

---

## 8. 핵심 구현 코드

### 8.1 꼬리질문 프롬프트 분리 (GeminiService)

```java
@Override
public String generateQuestion(Interview interview, Answer previousAnswer) {
    String systemPrompt = buildQuestionSystemPrompt(interview);
    String userPrompt;

    if (previousAnswer == null) {
        // 첫 질문
        userPrompt = buildFirstQuestionUserPrompt(interview);
    } else if (interview.isFollowUpEnabled()) {
        // 꼬리질문 활성화: 이전 답변 기반 질문
        userPrompt = buildFollowUpQuestionUserPrompt(interview, previousAnswer);
    } else {
        // 꼬리질문 비활성화: 새로운 주제 질문
        userPrompt = buildNewTopicQuestionUserPrompt(interview, previousAnswer);
    }

    return chatClient.prompt()
            .system(systemPrompt)
            .user(userPrompt)
            .call()
            .content().trim();
}
```

### 8.2 꼬리질문 프롬프트

```java
private String buildFollowUpQuestionUserPrompt(Interview interview, Answer previousAnswer) {
    return String.format(
            "이전 질문: %s\n\n" +
            "지원자 답변: %s\n\n" +
            "위 답변을 참고하여 꼬리질문을 해주세요.\n" +
            "- 답변이 부족했다면 같은 주제에서 더 깊이 파고드는 질문\n" +
            "- 답변에서 언급된 개념에 대한 심화 질문\n" +
            "- 신입 개발자가 아니라면 실무 적용 사례를 묻는 질문",
            previousAnswer.getQuestion().getContent(),
            previousAnswer.getContent()
    );
}
```

### 8.3 새로운 주제 프롬프트 (꼬리질문 비활성화)

```java
private String buildNewTopicQuestionUserPrompt(Interview interview, Answer previousAnswer) {
    return String.format(
            "현재 %d번째 질문까지 완료했습니다.\n\n" +
            "이전에 다룬 주제와 완전히 다른 새로운 기술 영역에서 질문해주세요.\n" +
            "- %s 분야의 다양한 주제를 고르게 다루세요\n" +
            "- 이전 질문: %s (이 주제는 피해주세요)\n" +
            "- 새롭고 흥미로운 주제로 질문해주세요.",
            interview.getQuestionCount(),
            interview.getType().getDescription(),
            previousAnswer.getQuestion().getContent()
    );
}
```

### 8.4 일일 횟수 초기화 스케줄러

```java
@EnableScheduling
@SpringBootApplication
public class InterviewAiBackendApplication { ... }

@RequiredArgsConstructor
@Component
public class DailyResetScheduler {

    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 0 * * *")  // 매일 자정
    @Transactional
    public void resetDailyInterviewCount() {
        userRepository.resetDailyInterviewCountForFreeUsers();
    }
}

// UserRepository
@Modifying
@Query("UPDATE User u SET u.dailyInterviewCount = 0 WHERE u.subscriptionType = 'FREE'")
void resetDailyInterviewCountForFreeUsers();
```

---

## 9. Frontend 구현

### 9.1 InterviewStartRequest 타입 수정

```typescript
export interface InterviewStartRequest {
  type: InterviewType;
  difficulty: InterviewDifficulty;
  customType?: string;
  questionLimit: number;      // 추가
  followUpEnabled: boolean;   // 추가
}
```

### 9.2 InterviewStartPage UI

```tsx
// 질문 개수 선택
const QUESTION_LIMITS = [3, 5, 7, 10];

// FREE 사용자 옵션 비활성화
<div className={isFreeUser ? 'opacity-50 pointer-events-none' : ''}>
  {QUESTION_LIMITS.map((limit) => (
    <button
      key={limit}
      onClick={() => setQuestionLimit(limit)}
      disabled={isFreeUser}
      className={questionLimit === limit ? 'active' : ''}
    >
      {limit}개
    </button>
  ))}
</div>

// 꼬리질문 토글
<button
  onClick={() => setFollowUpEnabled(!followUpEnabled)}
  disabled={isFreeUser}
>
  답변 기반 꼬리질문
</button>

// API 호출 시
const response = await startInterview({
  type: selectedType,
  difficulty: selectedDifficulty,
  customType: selectedType === 'OTHER' ? customType.trim() : undefined,
  questionLimit: isFreeUser ? 5 : questionLimit,
  followUpEnabled: isFreeUser ? false : followUpEnabled,
});
```

### 9.3 MyPage Premium 구독 카드

```tsx
{/* Premium Subscription Card */}
<div className="bg-white shadow rounded-xl p-6 mb-6">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold">구독 플랜</h3>
      <span className="badge">{user?.subscriptionType}</span>
      {user?.subscriptionType === 'FREE' ? (
        <p>일일 면접 3회 제한 | 질문 5개 고정 | 꼬리질문 비활성화</p>
      ) : (
        <p>무제한 면접 | 질문 개수 설정 | 꼬리질문 활성화</p>
      )}
    </div>

    {user?.subscriptionType === 'FREE' && (
      <button className="premium-button">
        Premium 업그레이드
      </button>
    )}
  </div>

  {/* Premium 혜택 목록 */}
  {user?.subscriptionType === 'FREE' && (
    <div className="premium-benefits">
      <span>1. 무제한 면접 진행</span>
      <span>2. 질문 개수 자유 설정 (3~10개)</span>
      <span>3. 답변 기반 꼬리질문</span>
    </div>
  )}
</div>
```

---

## 10. 파일 구조

### Backend
```
backend/src/main/java/com/interviewai/
├── InterviewAiBackendApplication.java  // @EnableScheduling 추가
├── domain/
│   ├── interview/
│   │   ├── entity/
│   │   │   └── Interview.java  // questionLimit, followUpEnabled 추가
│   │   └── service/
│   │       ├── InterviewService.java  // Premium 검증 로직
│   │       └── GeminiService.java     // 프롬프트 분리
│   └── user/
│       ├── entity/
│       │   └── User.java  // increaseAndCheckInterviewCount()
│       └── repository/
│           └── UserRepository.java  // resetDailyInterviewCountForFreeUsers()
└── global/
    └── scheduler/
        └── DailyResetScheduler.java  // 신규
```

### Frontend
```
frontend/src/
├── pages/
│   ├── interview/
│   │   └── InterviewStartPage.tsx  // 질문 개수/꼬리질문 UI
│   └── MyPage.tsx                  // Premium 구독 카드
└── types/
    └── index.ts  // InterviewStartRequest 수정
```

---

## 11. 구현 체크리스트

### Backend
- [x] Interview 엔티티 필드 추가 (questionLimit, followUpEnabled)
- [x] InterviewService Premium 검증 로직
- [x] GeminiService 프롬프트 3분할 (첫질문, 꼬리질문, 새주제)
- [x] UserRepository 벌크 업데이트 쿼리
- [x] DailyResetScheduler 구현
- [x] @EnableScheduling 추가
- [x] 빌드 테스트

### Frontend
- [x] InterviewStartRequest 타입 수정
- [x] InterviewStartPage 질문 개수 UI
- [x] InterviewStartPage 꼬리질문 토글 UI
- [x] FREE 사용자 옵션 비활성화
- [x] MyPage Premium 구독 카드
- [x] Premium 혜택 목록
- [x] 빌드 테스트

---

## 12. 다음 단계

### 12.1 Phase 6: 결제 시스템 (선택)
- 결제 게이트웨이 연동 (토스페이먼츠, 아임포트 등)
- 구독 결제 처리
- 결제 내역 관리
- Premium 자동 갱신/만료 처리

### 12.2 추가 개선 사항
- Premium 사용자 전용 분석 리포트
- 면접 녹음/녹화 기능
- 면접 공유 기능

---

> **Phase 5 구현 완료!**
> 2025-12-17

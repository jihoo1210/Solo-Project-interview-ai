# [Phase 4] 대시보드 및 통계 구현서 v1.0

> 작성일: 2025-12-17
> 버전: 1.0 (구현 완료)
> 작성자: AI Interview Simulator Team

---

## 1. 개요

Phase 4에서는 사용자의 면접 성과를 시각화하고 분석하는 대시보드 기능을 구현합니다. 면접 이력을 기반으로 성장 추이, 강약점 분석 기능을 제공합니다.

---

## 2. 주요 기능

### 2.1 면접 통계 대시보드
- 총 면접 횟수
- 완료된 면접 횟수
- 평균 점수 (정수)
- 최고/최저 점수
- 이번 달 면접 횟수

### 2.2 성장 추이 차트
- 시간대별 점수 변화 (라인 차트)
- 최근 10개 면접 점수 추이

### 2.3 카테고리별 강약점 분석
- 면접 유형별 평균 점수 비교 (바 차트)
- 난이도별 성과 분석 (바 차트)
- 강점 분야 (평균 7점 이상)
- 약점 분야 (평균 5점 이하)

### 2.4 최근 면접 목록
- 최근 5개 면접 표시
- 클릭 시 상세 페이지로 이동

---

## 3. 기술 스택

### 3.1 Backend
- Spring Boot 3.4.x
- JPA/JPQL 집계 쿼리 (GROUP BY, AVG, COUNT)
- DTO Projection (Object[] 매핑)

### 3.2 Frontend
- React 18 + TypeScript
- Recharts 2.x (차트 라이브러리)
- Tailwind CSS v4

---

## 4. Task 목록

### Backend

- [x] Task 1: 통계 DTO 설계 (DashboardStats, ScoreTrend, CategoryAnalysis, RecentInterview)
- [x] Task 2: InterviewRepository 집계 쿼리 추가
- [x] Task 3: DashboardService 구현
- [x] Task 4: DashboardController REST API 구현

### Frontend

- [x] Task 5: Dashboard 타입 정의 추가
- [x] Task 6: Dashboard API 함수 작성
- [x] Task 7: Recharts 설치
- [x] Task 8: DashboardTab 컴포넌트 구현 (MyPage 내 탭)
- [x] Task 9: 빌드 테스트

---

## 5. 데이터베이스 설계

### 5.1 추가 테이블 없음

기존 `interviews`, `questions`, `answers` 테이블의 데이터를 집계하여 통계를 생성합니다.

### 5.2 JPQL 집계 쿼리

```java
// 평균 점수
@Query("SELECT AVG(i.totalScore) FROM Interview i WHERE i.user = :user AND i.status = 'COMPLETED'")
Double calculateAverageScore(@Param("user") User user);

// 최고 점수
@Query("SELECT MAX(i.totalScore) FROM Interview i WHERE i.user = :user AND i.status = 'COMPLETED'")
Integer findMaxScore(@Param("user") User user);

// 최저 점수
@Query("SELECT MIN(i.totalScore) FROM Interview i WHERE i.user = :user AND i.status = 'COMPLETED'")
Integer findMinScore(@Param("user") User user);

// 유형별 통계 (유형, 평균점수, 개수)
@Query("SELECT i.type, AVG(i.totalScore), COUNT(i) FROM Interview i " +
       "WHERE i.user = :user AND i.status = 'COMPLETED' GROUP BY i.type")
List<Object[]> findStatsByType(@Param("user") User user);

// 난이도별 통계 (난이도, 평균점수, 개수)
@Query("SELECT i.difficulty, AVG(i.totalScore), COUNT(i) FROM Interview i " +
       "WHERE i.user = :user AND i.status = 'COMPLETED' GROUP BY i.difficulty")
List<Object[]> findStatsByDifficulty(@Param("user") User user);
```

---

## 6. API 설계

### 6.1 대시보드 통계 조회
```
GET /api/v1/dashboard/stats

Response:
{
  "success": true,
  "data": {
    "totalInterviews": 25,
    "completedInterviews": 20,
    "averageScore": 7,
    "highestScore": 9,
    "lowestScore": 4,
    "thisMonthCount": 8
  }
}
```

### 6.2 점수 추이 조회
```
GET /api/v1/dashboard/score-trend?limit=10

Response:
{
  "success": true,
  "data": [
    {
      "interviewId": 25,
      "score": 8,
      "type": "BACKEND",
      "difficulty": "MID",
      "date": "2025-12-17"
    }
  ]
}
```

### 6.3 카테고리별 분석
```
GET /api/v1/dashboard/category-analysis

Response:
{
  "success": true,
  "data": {
    "byType": [
      { "type": "BACKEND", "avgScore": 7, "count": 10 }
    ],
    "byDifficulty": [
      { "difficulty": "JUNIOR", "avgScore": 8, "count": 8 }
    ],
    "weakCategories": ["DEVOPS"],
    "strongCategories": ["BACKEND"]
  }
}
```

### 6.4 최근 면접 목록
```
GET /api/v1/dashboard/recent?limit=5

Response:
{
  "success": true,
  "data": [
    {
      "id": 25,
      "type": "BACKEND",
      "difficulty": "MID",
      "totalScore": 8,
      "questionCount": 5,
      "createdAt": "2025-12-17T14:30:00"
    }
  ]
}
```

---

## 7. DTO 설계 (구현 완료)

### 7.1 DashboardStatsResponse

```java
@Getter
@Builder
public class DashboardStatsResponse {
    private Long totalInterviews;        // 총 면접 횟수
    private Long completedInterviews;    // 완료된 면접 횟수
    private Integer averageScore;        // 평균 점수 (정수)
    private Integer highestScore;        // 최고 점수
    private Integer lowestScore;         // 최저 점수
    private Long thisMonthCount;         // 이번 달 면접 횟수

    public static DashboardStatsResponse of(..., Double averageScore, ...) {
        // Double → Integer 변환
        .averageScore(averageScore != null ? averageScore.intValue() : null)
    }
}
```

### 7.2 ScoreTrendResponse

```java
@Getter
@Builder
public class ScoreTrendResponse {
    private Long interviewId;
    private Integer score;
    private InterviewType type;
    private InterviewDifficulty difficulty;
    private LocalDate date;
}
```

### 7.3 CategoryAnalysisResponse

```java
@Getter
@Builder
public class CategoryAnalysisResponse {
    private List<TypeScore> byType;
    private List<DifficultyScore> byDifficulty;
    private List<String> weakCategories;
    private List<String> strongCategories;

    @Getter
    @Builder
    public static class TypeScore {
        private InterviewType type;
        private Integer avgScore;  // 정수
        private Long count;
    }

    @Getter
    @Builder
    public static class DifficultyScore {
        private InterviewDifficulty difficulty;
        private Integer avgScore;  // 정수
        private Long count;
    }
}
```

### 7.4 RecentInterviewResponse

```java
@Getter
@Builder
public class RecentInterviewResponse {
    private Long id;
    private InterviewType type;
    private InterviewDifficulty difficulty;
    private Integer totalScore;
    private Integer questionCount;
    private LocalDateTime createdAt;
}
```

---

## 8. Frontend 컴포넌트 설계 (구현 완료)

### 8.1 구조

대시보드는 별도 페이지가 아닌 **MyPage 내 탭**으로 구현되었습니다.

```
MyPage
├── 탭 네비게이션
│   ├── 대시보드 (기본 탭)
│   ├── 프로필 수정
│   └── 비밀번호 변경
└── DashboardTab
    ├── StatsCards (4개: 총 면접, 완료된 면접, 평균 점수, 이번 달)
    ├── ScoreRange (최고/최저 점수)
    ├── ScoreTrendChart (LineChart)
    ├── CategoryAnalysis
    │   ├── TypeBarChart (유형별 점수, 가로 BarChart)
    │   └── DifficultyBarChart (난이도별 점수, 가로 BarChart)
    ├── StrengthWeakness (강점/약점 분야 배지)
    └── RecentInterviews (최근 면접 목록, 클릭 가능)
```

### 8.2 차트 라이브러리

Recharts 사용:
- `<LineChart>` - 점수 추이
- `<BarChart layout="vertical">` - 카테고리별 비교
- `<ResponsiveContainer>` - 반응형 차트

### 8.3 점수별 색상

```typescript
const getScoreColor = (score: number) => {
  if (score >= 8) return '#22C55E'; // 초록 (success)
  if (score >= 6) return '#F59E0B'; // 노랑 (warning)
  return '#EF4444';                  // 빨강 (error)
};
```

---

## 9. 파일 구조

### Backend
```
backend/src/main/java/com/interviewai/domain/dashboard/
├── controller/
│   └── DashBoardController.java
├── service/
│   └── DashboardService.java
└── dto/
    ├── DashboardStatsResponse.java
    ├── ScoreTrendResponse.java
    ├── CategoryAnalysisResponse.java
    └── RecentInterviewResponse.java
```

### Frontend
```
frontend/src/
├── api/
│   └── dashboard.ts
├── components/
│   └── dashboard/
│       └── DashboardTab.tsx
├── pages/
│   └── MyPage.tsx (수정)
└── types/
    └── index.ts (Dashboard 타입 추가)
```

---

## 10. 구현 체크리스트

### Backend
- [x] DashboardStatsResponse DTO
- [x] ScoreTrendResponse DTO
- [x] CategoryAnalysisResponse DTO
- [x] RecentInterviewResponse DTO
- [x] InterviewRepository 집계 메서드 추가
- [x] DashboardService 구현
- [x] DashboardController 구현
- [x] @RequestParam name 속성 추가 (파라미터 이름 명시)
- [x] 빌드 테스트

### Frontend
- [x] Recharts 설치 (`npm install recharts`)
- [x] Dashboard 타입 정의 (types/index.ts)
- [x] dashboard API 함수 작성 (api/dashboard.ts)
- [x] DashboardTab 컴포넌트 구현
- [x] MyPage에 대시보드 탭 추가
- [x] Tooltip formatter 타입 오류 수정
- [x] 빌드 테스트

---

## 11. 추가 수정 사항

### 11.1 무응답 0점 처리

면접 시 빈 답변(무응답)을 제출하면 AI 호출 없이 즉시 0점이 부여됩니다.

```java
// GeminiService.java
if (answer.getContent() == null || answer.getContent().trim().isEmpty()) {
    return EvaluationResult.builder()
            .score(0)
            .feedback("답변이 제출되지 않았습니다.")
            .modelAnswer("질문에 대한 답변을 작성해주세요.")
            .build();
}
```

---

## 12. 다음 단계

### 12.1 Phase 5: Premium 기능
- 면접 질문 갯수 설정
- 꼬리질문 기능
- 무제한 면접

### 12.2 Phase 6: 결제 시스템
- 구독 결제 연동
- 결제 내역 관리

---

> **Phase 4 구현 완료!**
> 2025-12-17

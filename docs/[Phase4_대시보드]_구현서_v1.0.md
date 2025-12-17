# [Phase 4] 대시보드 및 통계 구현서 v1.0

> 작성일: 2025-12-17
> 버전: 1.0 (초안)
> 작성자: AI Interview Simulator Team

---

## 1. 개요

Phase 4에서는 사용자의 면접 성과를 시각화하고 분석하는 대시보드 기능을 구현합니다. 면접 이력을 기반으로 성장 추이, 강약점 분석, 학습 추천 기능을 제공합니다.

---

## 2. 주요 기능

### 2.1 면접 통계 대시보드
- 총 면접 횟수
- 평균 점수 및 추이
- 최근 면접 성과

### 2.2 성장 추이 차트
- 시간대별 점수 변화 (라인 차트)
- 월별/주별 면접 횟수
- 점수 분포 히스토그램

### 2.3 카테고리별 강약점 분석
- 면접 유형별 평균 점수 비교
- 난이도별 성과 분석
- 약점 카테고리 식별

### 2.4 학습 추천 (Phase 5에서 고도화)
- 약점 기반 추천 토픽
- 재도전 추천 면접 유형

---

## 3. 기술 스택

### 3.1 Backend
- Spring Boot 3.4.x
- JPA 집계 쿼리 (GROUP BY, AVG, COUNT)
- DTO Projection

### 3.2 Frontend
- React 18 + TypeScript
- Recharts (차트 라이브러리)
- Tailwind CSS v4

---

## 4. Task 목록

### Backend

- [ ] Task 1: 통계 DTO 설계 (DashboardStats, ScoreTrend, CategoryAnalysis)
- [ ] Task 2: InterviewRepository 집계 쿼리 추가
- [ ] Task 3: DashboardService 구현
- [ ] Task 4: DashboardController REST API 구현

### Frontend

- [ ] Task 5: 대시보드 메인 페이지 레이아웃
- [ ] Task 6: 통계 카드 컴포넌트 (총 면접, 평균 점수 등)
- [ ] Task 7: 성장 추이 라인 차트
- [ ] Task 8: 카테고리별 점수 바 차트
- [ ] Task 9: 최근 면접 목록 위젯
- [ ] Task 10: 홈페이지에서 대시보드 링크 추가

---

## 5. 데이터베이스 설계

### 5.1 추가 테이블 없음

기존 `interviews`, `questions`, `answers` 테이블의 데이터를 집계하여 통계를 생성합니다.

### 5.2 집계 쿼리 예시

```sql
-- 총 면접 횟수
SELECT COUNT(*) FROM interviews WHERE user_id = ? AND status = 'COMPLETED';

-- 평균 점수
SELECT AVG(total_score) FROM interviews WHERE user_id = ? AND status = 'COMPLETED';

-- 유형별 평균 점수
SELECT type, AVG(total_score) as avg_score, COUNT(*) as count
FROM interviews
WHERE user_id = ? AND status = 'COMPLETED'
GROUP BY type;

-- 최근 N개 면접 점수 추이
SELECT id, total_score, created_at
FROM interviews
WHERE user_id = ? AND status = 'COMPLETED'
ORDER BY created_at DESC
LIMIT ?;
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
    "averageScore": 7.2,
    "highestScore": 9,
    "lowestScore": 4,
    "currentStreak": 5,
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
    },
    {
      "interviewId": 24,
      "score": 7,
      "type": "FRONTEND",
      "difficulty": "JUNIOR",
      "date": "2025-12-16"
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
      { "type": "BACKEND", "avgScore": 7.5, "count": 10 },
      { "type": "FRONTEND", "avgScore": 6.8, "count": 8 },
      { "type": "FULLSTACK", "avgScore": 7.0, "count": 2 }
    ],
    "byDifficulty": [
      { "difficulty": "JUNIOR", "avgScore": 8.0, "count": 8 },
      { "difficulty": "MID", "avgScore": 7.0, "count": 10 },
      { "difficulty": "SENIOR", "avgScore": 5.5, "count": 2 }
    ],
    "weakCategories": ["DEVOPS", "DATA"],
    "strongCategories": ["BACKEND", "FRONTEND"]
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

## 7. DTO 설계

### 7.1 DashboardStatsResponse

```java
@Getter
@Builder
public class DashboardStatsResponse {
    private Long totalInterviews;
    private Long completedInterviews;
    private Double averageScore;
    private Integer highestScore;
    private Integer lowestScore;
    private Integer currentStreak;
    private Long thisMonthCount;
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
        private Double avgScore;
        private Long count;
    }

    @Getter
    @Builder
    public static class DifficultyScore {
        private InterviewDifficulty difficulty;
        private Double avgScore;
        private Long count;
    }
}
```

---

## 8. Frontend 컴포넌트 설계

### 8.1 페이지 구조

```
DashboardPage
├── StatsCards (통계 카드 4개)
│   ├── TotalInterviewsCard
│   ├── AverageScoreCard
│   ├── StreakCard
│   └── ThisMonthCard
├── ScoreTrendChart (라인 차트)
├── CategoryAnalysisSection
│   ├── TypeBarChart (유형별 점수)
│   └── DifficultyBarChart (난이도별 점수)
├── WeakPointsSection (약점 분석)
└── RecentInterviewsWidget (최근 면접)
```

### 8.2 차트 라이브러리

Recharts 사용 예정:
- `<LineChart>` - 점수 추이
- `<BarChart>` - 카테고리별 비교
- `<RadarChart>` - 종합 역량 (기존 결과 페이지 재활용)

### 8.3 반응형 디자인

- Desktop: 2열 그리드
- Tablet: 1열 그리드
- Mobile: 스택 레이아웃

---

## 9. 라우팅

| 경로 | 페이지 | 접근 권한 |
|------|--------|-----------|
| `/dashboard` | 대시보드 메인 | Private |

### 9.1 네비게이션 수정

```
홈페이지 헤더에 "대시보드" 링크 추가
└── 면접 시작 | 면접 기록 | 대시보드 | 마이페이지
```

---

## 10. 진행 상황

### 10.1 대기 중

Phase 3 완료 후 진행 예정

### 10.2 예상 작업량

- Backend: Task 1-4 (약 4개 Task)
- Frontend: Task 5-10 (약 6개 Task)
- 총 10개 Task

---

## 11. 다음 단계

### 11.1 Phase 5: Premium 기능
- 면접 질문 갯수 설정
- 꼬리질문 기능
- 무제한 면접

### 11.2 Phase 6: 결제 시스템
- 구독 결제 연동
- 결제 내역 관리

---

## 12. 구현 체크리스트

### Backend
- [ ] DashboardStatsResponse DTO
- [ ] ScoreTrendResponse DTO
- [ ] CategoryAnalysisResponse DTO
- [ ] InterviewRepository 집계 메서드 추가
- [ ] DashboardService 구현
- [ ] DashboardController 구현
- [ ] API 테스트

### Frontend
- [ ] Recharts 설치 (`npm install recharts`)
- [ ] dashboard API 함수 작성
- [ ] DashboardPage 레이아웃
- [ ] StatsCards 컴포넌트
- [ ] ScoreTrendChart 컴포넌트
- [ ] CategoryBarCharts 컴포넌트
- [ ] RecentInterviewsWidget 컴포넌트
- [ ] App.tsx 라우트 추가
- [ ] 네비게이션 메뉴 추가
- [ ] 빌드 테스트

---

> **Phase 4 구현 준비 완료!**
> 코드 작성을 요청하시면 Task별로 진행합니다.

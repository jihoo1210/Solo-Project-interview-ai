# JPA Repository 메서드 네이밍 vs @Query

> 작성일: 2024-12-16
> Phase: 3 - 면접 시뮬레이션

---

## 1. 질문

Repository에서 `@Query`를 사용한 이유가 뭐야? JPA 메서드 네이밍 규칙으로 충분하지 않아?

---

## 2. JPA 메서드 네이밍 규칙

Spring Data JPA는 메서드 이름만으로 쿼리를 자동 생성합니다.

### 기본 문법

```java
findBy + 필드명 + 조건
```

### 예시

| 메서드명 | 생성되는 쿼리 |
|----------|--------------|
| `findByEmail(String email)` | `WHERE email = ?` |
| `findByNameAndAge(String name, int age)` | `WHERE name = ? AND age = ?` |
| `findByAgeGreaterThan(int age)` | `WHERE age > ?` |
| `findByNameContaining(String keyword)` | `WHERE name LIKE %?%` |
| `findByStatusOrderByCreatedAtDesc(Status s)` | `WHERE status = ? ORDER BY created_at DESC` |

### 연관 엔티티 탐색

점(.)으로 연결된 필드는 언더스코어 없이 이어서 작성:

```java
// Question → Interview 관계 탐색
List<Answer> findByQuestionInterview(Interview interview);
// 생성 쿼리: SELECT a FROM Answer a WHERE a.question.interview = ?
```

---

## 3. @Query가 필요한 경우

### 3.1 집계 함수 (AVG, SUM, COUNT, MAX, MIN)

```java
// ❌ 네이밍 규칙으로 불가능
// ✅ @Query 필요
@Query("SELECT AVG(a.score) FROM Answer a WHERE a.question.interview = :interview")
Double calculateAverageScoreByInterview(@Param("interview") Interview interview);

@Query("SELECT MAX(q.orderNumber) FROM Question q WHERE q.interview = :interview")
Optional<Integer> findMaxOrderNumberByInterview(@Param("interview") Interview interview);
```

### 3.2 FETCH JOIN (N+1 문제 해결)

```java
// ❌ 네이밍 규칙으로 불가능
// ✅ @Query 필요
@Query("SELECT i FROM Interview i LEFT JOIN FETCH i.questions WHERE i.id = :id")
Optional<Interview> findByIdWithQuestions(@Param("id") Long id);
```

### 3.3 복잡한 조건/서브쿼리

```java
@Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT i.user.id FROM Interview i)")
List<User> findUsersWithoutInterview();
```

---

## 4. 실제 리팩토링 예시

### 변경 전 (불필요한 @Query)

```java
@Query("SELECT a FROM Answer a WHERE a.question.interview = :interview")
List<Answer> findByInterview(@Param("interview") Interview interview);

@Query("SELECT q FROM Question q WHERE q.interview = :interview AND q.answer IS NULL ORDER BY q.orderNumber ASC")
List<Question> findUnansweredQuestionsByInterview(@Param("interview") Interview interview);

@Query("SELECT COUNT(i) FROM Interview i WHERE i.user = :user AND i.status = :status")
long countByUserAndStatus(@Param("user") User user, @Param("status") InterviewStatus status);
```

### 변경 후 (네이밍 규칙 활용)

```java
List<Answer> findByQuestionInterview(Interview interview);

List<Question> findByInterviewAndAnswerIsNullOrderByOrderNumberAsc(Interview interview);

long countByUserAndStatus(User user, InterviewStatus status);
```

---

## 5. 판단 기준

| 상황 | 사용 방법 |
|------|----------|
| 단순 조회 (WHERE, ORDER BY) | 네이밍 규칙 |
| 집계 함수 (AVG, MAX, COUNT 등) | @Query |
| FETCH JOIN | @Query |
| 서브쿼리/복잡한 조건 | @Query |
| 네이티브 SQL 필요 | @Query(nativeQuery=true) |

---

## 6. 핵심 정리

1. **네이밍 규칙 우선**: 단순한 쿼리는 메서드 이름으로 해결
2. **@Query는 필요할 때만**: 집계, FETCH JOIN, 복잡한 조건
3. **가독성 고려**: 메서드명이 너무 길어지면 @Query가 나을 수 있음

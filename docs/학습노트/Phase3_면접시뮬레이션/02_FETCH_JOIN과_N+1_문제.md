# FETCH JOIN과 N+1 문제

> 작성일: 2024-12-16
> Phase: 3 - 면접 시뮬레이션

---

## 1. 질문

FETCH JOIN은 필요 없지 않아? 어차피 객체에서 getter로 참조하면 되는데.

---

## 2. N+1 문제란?

연관된 엔티티를 조회할 때, 1번의 쿼리로 끝나지 않고 N번의 추가 쿼리가 발생하는 문제입니다.

### 예시 상황

```java
// Interview에 Question이 5개 연관되어 있다고 가정
Interview interview = interviewRepository.findById(1L);  // 쿼리 1번

for (Question q : interview.getQuestions()) {  // questions 조회: 쿼리 1번
    System.out.println(q.getAnswer().getContent());  // 각 answer 조회: 쿼리 5번
}
// 총: 1 + 1 + 5 = 7번 쿼리!
```

### 왜 이런 일이 발생하나?

JPA의 기본 페치 전략이 `LAZY`이기 때문입니다.

```java
@OneToMany(mappedBy = "interview", fetch = FetchType.LAZY)  // 기본값
private List<Question> questions;
```

- `LAZY`: 실제로 접근할 때 쿼리 실행 (지연 로딩)
- `EAGER`: 엔티티 조회 시 함께 로딩 (즉시 로딩)

---

## 3. FETCH JOIN 해결책

### LEFT JOIN vs LEFT JOIN FETCH

```sql
-- 일반 SQL LEFT JOIN
SELECT i.*, q.*
FROM interviews i
LEFT JOIN questions q ON i.id = q.interview_id

-- JPQL LEFT JOIN (연관 데이터 로딩 안함)
SELECT i FROM Interview i LEFT JOIN i.questions q WHERE i.id = 1
-- 결과: Interview만 로딩, questions는 여전히 LAZY

-- JPQL LEFT JOIN FETCH (연관 데이터 즉시 로딩)
SELECT i FROM Interview i LEFT JOIN FETCH i.questions q WHERE i.id = 1
-- 결과: Interview + questions 한 번에 로딩
```

### FETCH 키워드의 의미

`FETCH`는 **JPQL 전용 키워드**로, 조인한 연관 엔티티를 **영속성 컨텍스트에 즉시 로딩**하라는 의미입니다.

---

## 4. 실제 코드 비교

### FETCH JOIN 없이 (N+1 발생)

```java
// Repository
Optional<Interview> findById(Long id);

// Service
Interview interview = repo.findById(1L).get();  // 쿼리 1
List<Question> questions = interview.getQuestions();  // 쿼리 2
for (Question q : questions) {
    Answer a = q.getAnswer();  // 쿼리 3, 4, 5, 6, 7...
}
```

### FETCH JOIN 사용 (1번 쿼리)

```java
// Repository
@Query("SELECT i FROM Interview i " +
       "LEFT JOIN FETCH i.questions q " +
       "LEFT JOIN FETCH q.answer " +
       "WHERE i.id = :id")
Optional<Interview> findByIdWithQuestionsAndAnswers(@Param("id") Long id);

// Service
Interview interview = repo.findByIdWithQuestionsAndAnswers(1L).get();  // 쿼리 1번
// questions, answers 모두 이미 로딩됨!
```

---

## 5. 언제 FETCH JOIN을 사용할까?

| 상황 | 권장 방법 |
|------|----------|
| 연관 데이터를 반드시 사용 | FETCH JOIN |
| 연관 데이터가 소량 (5개 이하) | 둘 다 OK |
| 연관 데이터가 대량 | 페이징 + 별도 쿼리 |
| 연관 데이터를 사용 안 할 수도 있음 | LAZY (기본) |

### 현재 프로젝트에서는?

- 면접당 질문: 최대 5개
- 질문당 답변: 1개

데이터가 적어서 N+1 문제가 심각하지 않지만, **면접 상세 조회** 시 모든 데이터가 필요하므로 FETCH JOIN이 효율적입니다.

---

## 6. 주의사항

### 6.1 컬렉션 FETCH JOIN은 1개만

```java
// ❌ 에러! 2개 이상의 컬렉션 FETCH JOIN 불가
SELECT i FROM Interview i
LEFT JOIN FETCH i.questions
LEFT JOIN FETCH i.feedbacks

// ✅ 하나만 FETCH JOIN, 나머지는 별도 조회
```

### 6.2 페이징과 함께 사용 시 주의

```java
// ⚠️ 경고! 컬렉션 FETCH JOIN + 페이징 = 메모리에서 페이징
@Query("SELECT i FROM Interview i LEFT JOIN FETCH i.questions")
Page<Interview> findAllWithQuestions(Pageable pageable);
// Hibernate 경고: firstResult/maxResults specified with collection fetch
```

---

## 7. 대안: @EntityGraph

```java
// @Query 없이 FETCH JOIN 효과
@EntityGraph(attributePaths = {"questions", "questions.answer"})
Optional<Interview> findById(Long id);
```

---

## 8. 핵심 정리

1. **N+1 문제**: 연관 엔티티 조회 시 쿼리가 1+N번 발생
2. **FETCH JOIN**: 한 번의 쿼리로 연관 엔티티까지 로딩
3. **FETCH는 JPQL 전용**: SQL의 JOIN과 다름
4. **필요할 때만 사용**: 항상 FETCH JOIN이 좋은 건 아님

# JPQL 기초

> 작성일: 2025-12-17
> Phase 4 대시보드 구현 중 학습한 내용

---

## 1. JPQL이란?

**JPQL (Java Persistence Query Language)** 은 JPA에서 사용하는 객체 지향 쿼리 언어입니다.

### SQL vs JPQL

| 구분 | SQL | JPQL |
|------|-----|------|
| 대상 | 테이블 | 엔티티 |
| 컬럼 | 테이블 컬럼명 | 엔티티 필드명 |
| 대소문자 | 보통 대소문자 구분 없음 | 엔티티/필드명 대소문자 구분 |

```sql
-- SQL
SELECT * FROM interviews WHERE user_id = 1;

-- JPQL
SELECT i FROM Interview i WHERE i.user = :user
```

**핵심 차이점**: JPQL은 테이블이 아닌 **엔티티 객체**를 대상으로 쿼리합니다.

---

## 2. @Query 어노테이션

Spring Data JPA에서 JPQL을 사용하려면 `@Query` 어노테이션을 사용합니다.

### 기본 사용법

```java
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    // 메서드 이름 기반 쿼리 (Spring Data JPA가 자동 생성)
    List<Interview> findByUser(User user);

    // JPQL 직접 작성
    @Query("SELECT i FROM Interview i WHERE i.user = :user AND i.status = :status")
    List<Interview> findByUserAndStatus(@Param("user") User user,
                                         @Param("status") InterviewStatus status);
}
```

### @Param 어노테이션

JPQL에서 `:파라미터명` 형식으로 바인딩 변수를 사용할 때 `@Param`으로 매핑합니다.

```java
@Query("SELECT i FROM Interview i WHERE i.user = :user")
List<Interview> findByUser(@Param("user") User user);
//                          ↑ JPQL의 :user와 매핑
```

---

## 3. 집계 함수 (Aggregate Functions)

JPQL은 SQL과 동일한 집계 함수를 지원합니다.

### COUNT - 개수

```java
// 전체 개수
@Query("SELECT COUNT(i) FROM Interview i WHERE i.user = :user")
Long countByUser(@Param("user") User user);

// Spring Data JPA 메서드명 규칙으로도 가능
long countByUser(User user);
```

### AVG - 평균

```java
@Query("SELECT AVG(i.totalScore) FROM Interview i WHERE i.user = :user AND i.status = 'COMPLETED'")
Double calculateAverageScore(@Param("user") User user);
```

**주의**: AVG는 항상 `Double`을 반환합니다.

### MAX / MIN - 최대/최소

```java
@Query("SELECT MAX(i.totalScore) FROM Interview i WHERE i.user = :user AND i.status = 'COMPLETED'")
Integer findMaxScore(@Param("user") User user);

@Query("SELECT MIN(i.totalScore) FROM Interview i WHERE i.user = :user AND i.status = 'COMPLETED'")
Integer findMinScore(@Param("user") User user);
```

### SUM - 합계

```java
@Query("SELECT SUM(i.totalScore) FROM Interview i WHERE i.user = :user")
Long calculateTotalScore(@Param("user") User user);
```

---

## 4. GROUP BY - 그룹화

여러 행을 그룹으로 묶어 집계할 때 사용합니다.

### 기본 사용법

```java
// 유형별 통계: 유형, 평균점수, 개수
@Query("SELECT i.type, AVG(i.totalScore), COUNT(i) FROM Interview i " +
       "WHERE i.user = :user AND i.status = 'COMPLETED' GROUP BY i.type")
List<Object[]> findStatsByType(@Param("user") User user);
```

### 반환 타입: Object[]

GROUP BY와 여러 컬럼을 SELECT할 때는 `List<Object[]>`를 반환합니다.

```java
List<Object[]> results = interviewRepository.findStatsByType(user);

for (Object[] row : results) {
    InterviewType type = (InterviewType) row[0];  // 첫 번째 컬럼
    Double avgScore = (Double) row[1];            // 두 번째 컬럼
    Long count = (Long) row[2];                   // 세 번째 컬럼
}
```

### 실제 프로젝트 예시

```java
// DashboardService.java
List<TypeScore> byType = interviewRepository.findStatsByType(user).stream()
        .map(row -> TypeScore.builder()
                .type((InterviewType) row[0])
                .avgScore(((Double) row[1]).intValue())  // Double → Integer 변환
                .count((Long) row[2])
                .build())
        .toList();
```

---

## 5. 엔티티 상태 조건 (Enum)

JPQL에서 Enum 값을 조건으로 사용할 때는 문자열로 지정합니다.

```java
// 방법 1: 문자열로 직접 지정
@Query("SELECT i FROM Interview i WHERE i.status = 'COMPLETED'")
List<Interview> findCompleted();

// 방법 2: 파라미터로 전달
@Query("SELECT i FROM Interview i WHERE i.status = :status")
List<Interview> findByStatus(@Param("status") InterviewStatus status);
```

---

## 6. JOIN FETCH - N+1 문제 해결

연관 엔티티를 한 번에 조회하려면 `JOIN FETCH`를 사용합니다.

### N+1 문제란?

```java
// 문제: Interview 조회 후, 각 Interview의 questions를 개별 조회 (N번 추가 쿼리)
List<Interview> interviews = interviewRepository.findByUser(user);
for (Interview i : interviews) {
    i.getQuestions().size();  // 여기서 추가 쿼리 발생!
}
```

### JOIN FETCH로 해결

```java
@Query("SELECT i FROM Interview i " +
       "JOIN FETCH i.questions q " +
       "LEFT JOIN FETCH q.answer " +
       "WHERE i.id = :id")
Optional<Interview> findByIdWithQuestionsAndAnswers(@Param("id") Long id);
```

이렇게 하면 Interview + Questions + Answers를 **한 번의 쿼리**로 조회합니다.

---

## 7. 정렬 (ORDER BY)

```java
// JPQL에서 정렬
@Query("SELECT i FROM Interview i WHERE i.user = :user ORDER BY i.createdAt DESC")
List<Interview> findByUserOrderByCreatedAtDesc(@Param("user") User user);

// Spring Data JPA 메서드명 규칙
List<Interview> findByUserOrderByCreatedAtDesc(User user);
```

---

## 8. 페이징 (Pageable)

Spring Data JPA의 `Pageable`을 JPQL과 함께 사용할 수 있습니다.

```java
// Repository
List<Interview> findByUserAndStatusOrderByCreatedAtDesc(
    User user,
    InterviewStatus status,
    Pageable pageable
);

// Service
Pageable pageable = PageRequest.of(0, 10);  // 첫 페이지, 10개
List<Interview> interviews = repository.findByUserAndStatusOrderByCreatedAtDesc(
    user,
    InterviewStatus.COMPLETED,
    pageable
);
```

---

## 9. Native Query

JPQL로 표현하기 어려운 경우 SQL을 직접 사용할 수 있습니다.

```java
@Query(value = "SELECT * FROM interviews WHERE MONTH(created_at) = :month",
       nativeQuery = true)
List<Interview> findByMonth(@Param("month") int month);
```

**주의**: Native Query는 테이블명과 컬럼명을 사용합니다 (엔티티명 X).

---

## 10. 메서드 이름 기반 쿼리 vs @Query

### 언제 메서드명 규칙을 사용?

- 단순한 조건 조회
- `findBy`, `countBy`, `existsBy` 등

```java
// 메서드명만으로 충분
List<Interview> findByUser(User user);
long countByUserAndStatus(User user, InterviewStatus status);
boolean existsByUserAndStatus(User user, InterviewStatus status);
```

### 언제 @Query를 사용?

- 복잡한 조건
- 집계 함수 (AVG, SUM 등)
- GROUP BY
- JOIN FETCH
- 서브쿼리

```java
// @Query 필요
@Query("SELECT AVG(i.totalScore) FROM Interview i WHERE i.user = :user")
Double calculateAverageScore(@Param("user") User user);

@Query("SELECT i.type, COUNT(i) FROM Interview i GROUP BY i.type")
List<Object[]> countByType();
```

---

## 11. 실제 프로젝트 적용 예시

### InterviewRepository.java

```java
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    // ============================================
    // 기본 조회 (메서드명 규칙)
    // ============================================

    List<Interview> findByUser(User user);
    long countByUser(User user);
    long countByUserAndStatus(User user, InterviewStatus status);

    // ============================================
    // 통계 집계 (JPQL)
    // ============================================

    @Query("SELECT AVG(i.totalScore) FROM Interview i " +
           "WHERE i.user = :user AND i.status = 'COMPLETED'")
    Double calculateAverageScore(@Param("user") User user);

    @Query("SELECT MAX(i.totalScore) FROM Interview i " +
           "WHERE i.user = :user AND i.status = 'COMPLETED'")
    Integer findMaxScore(@Param("user") User user);

    @Query("SELECT i.type, AVG(i.totalScore), COUNT(i) FROM Interview i " +
           "WHERE i.user = :user AND i.status = 'COMPLETED' GROUP BY i.type")
    List<Object[]> findStatsByType(@Param("user") User user);
}
```

---

## 핵심 정리

| 개념 | 설명 |
|------|------|
| JPQL | 엔티티 기반 쿼리 언어 |
| @Query | JPQL을 직접 작성할 때 사용 |
| @Param | 파라미터 바인딩 |
| 집계 함수 | COUNT, AVG, MAX, MIN, SUM |
| GROUP BY | 그룹별 집계 |
| Object[] | 다중 컬럼 반환 시 사용 |
| JOIN FETCH | N+1 문제 해결 |
| Pageable | 페이징 처리 |

---

## 참고 자료

- [Spring Data JPA 공식 문서](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [JPQL Reference](https://docs.oracle.com/javaee/7/tutorial/persistence-querylanguage.htm)

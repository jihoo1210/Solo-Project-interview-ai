package com.interviewai.domain.interview.repository;

import com.interviewai.domain.interview.entity.Interview;
import com.interviewai.domain.interview.entity.InterviewStatus;
import com.interviewai.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    // ============================================
    // 기본 조회
    // ============================================

    // 사용자의 면접 목록 조회 (최신순, 페이징)
    Page<Interview> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    // 사용자 + 상태로 면접 목록 조회
    List<Interview> findByUserAndStatus(User user, InterviewStatus status);

    // 사용자 + 상태로 면접 목록 조회 (최신순, 페이징)
    List<Interview> findByUserAndStatusOrderByCreatedAtDesc(
            User user, InterviewStatus status, Pageable pageable);

    // ============================================
    // Fetch Join 조회 (N+1 방지)
    // ============================================

    // 면접 + 질문 조회
    @Query("SELECT i FROM Interview i LEFT JOIN FETCH i.questions WHERE i.id = :id")
    Optional<Interview> findByIdWithQuestions(@Param("id") Long id);

    // 면접 + 질문 + 답변 조회
    @Query("SELECT i FROM Interview i " +
           "LEFT JOIN FETCH i.questions q " +
           "LEFT JOIN FETCH q.answer " +
           "WHERE i.id = :id")
    Optional<Interview> findByIdWithQuestionsAndAnswers(@Param("id") Long id);

    // ============================================
    // 개수 조회 (COUNT)
    // ============================================

    long countByUser(User user);

    // 사용자 + 상태별 면접 수
    long countByUserAndStatus(User user, InterviewStatus status);

    // 특정 시점 이후 면접 수 (오늘 면접 수, 이번 달 면접 수에 사용)
    long countByUserAndCreatedAtGreaterThanEqual(User user, LocalDateTime dateTime);

    // ============================================
    // 통계 집계 (Dashboard용)
    // ============================================

    // 평균 점수
    @Query("SELECT AVG(i.totalScore) FROM Interview i " +
           "WHERE i.user = :user AND i.status = 'COMPLETED'")
    Double calculateAverageScore(@Param("user") User user);

    // 최고 점수
    @Query("SELECT MAX(i.totalScore) FROM Interview i " +
           "WHERE i.user = :user AND i.status = 'COMPLETED'")
    Integer findMaxScore(@Param("user") User user);

    // 최저 점수
    @Query("SELECT MIN(i.totalScore) FROM Interview i " +
           "WHERE i.user = :user AND i.status = 'COMPLETED'")
    Integer findMinScore(@Param("user") User user);

    // 유형별 통계 (유형, 평균점수, 개수)
    @Query("SELECT i.type, AVG(i.totalScore), COUNT(i) FROM Interview i " +
           "WHERE i.user = :user AND i.status = 'COMPLETED' GROUP BY i.type")
    List<Object[]> findStatsByType(@Param("user") User user);

    // 난이도별 통계 (난이도, 평균점수, 개수)
    @Query("SELECT i.difficulty, AVG(i.totalScore), COUNT(i) FROM Interview i " +
           "WHERE i.user = :user AND i.status = 'COMPLETED' GROUP BY i.difficulty")
    List<Object[]> findStatsByDifficulty(@Param("user") User user);
}

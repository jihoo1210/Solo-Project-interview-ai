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

    Page<Interview> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<Interview> findByUserAndStatus(User user, InterviewStatus status);

    @Query("SELECT i FROM Interview i LEFT JOIN FETCH i.questions WHERE i.id = :id")
    Optional<Interview> findByIdWithQuestions(@Param("id") Long id);

    @Query("SELECT i FROM Interview i " +
           "LEFT JOIN FETCH i.questions q " +
           "LEFT JOIN FETCH q.answer " +
           "WHERE i.id = :id")
    Optional<Interview> findByIdWithQuestionsAndAnswers(@Param("id") Long id);

    long countByUserAndStatus(User user, InterviewStatus status);

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.user = :user AND i.createdAt >= :startOfDay")
    long countByUserAndCreatedAtAfter(@Param("user") User user, @Param("startOfDay") LocalDateTime startOfDay);
}

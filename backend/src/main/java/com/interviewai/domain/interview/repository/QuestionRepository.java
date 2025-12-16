package com.interviewai.domain.interview.repository;

import com.interviewai.domain.interview.entity.Interview;
import com.interviewai.domain.interview.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByInterviewOrderByOrderNumberAsc(Interview interview);

    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.answer WHERE q.id = :id")
    Optional<Question> findByIdWithAnswer(@Param("id") Long id);

    @Query("SELECT MAX(q.orderNumber) FROM Question q WHERE q.interview = :interview")
    Optional<Integer> findMaxOrderNumberByInterview(@Param("interview") Interview interview);

    List<Question> findByInterviewAndAnswerIsNullOrderByOrderNumberAsc(Interview interview);
}

package com.interviewai.domain.interview.repository;

import com.interviewai.domain.interview.entity.Answer;
import com.interviewai.domain.interview.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    List<Answer> findByQuestionInterview(Interview interview);

    @Query("SELECT AVG(a.score) FROM Answer a WHERE a.question.interview = :interview AND a.score IS NOT NULL")
    Double calculateAverageScoreByInterview(@Param("interview") Interview interview);
}

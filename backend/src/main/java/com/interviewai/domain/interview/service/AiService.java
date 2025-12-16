package com.interviewai.domain.interview.service;

import com.interviewai.domain.interview.dto.EvaluationResult;
import com.interviewai.domain.interview.dto.SummaryResult;
import com.interviewai.domain.interview.entity.Answer;
import com.interviewai.domain.interview.entity.Interview;
import com.interviewai.domain.interview.entity.Question;

public interface AiService {

    /**
     * 면접 질문 생성
     * @param interview 면접 세션
     * @param previousAnswer 이전 답변 (첫 질문일 경우 null)
     * @return 생성된 질문 내용
     */
    String generateQuestion(Interview interview, Answer previousAnswer);

    /**
     * 답변 평가
     * @param question 질문
     * @param answer 답변
     * @return 평가 결과 (점수, 피드백, 모범답안)
     */
    EvaluationResult evaluateAnswer(Question question, Answer answer);

    /**
     * 면접 종합 평가
     * @param interview 면접 세션
     * @return 종합 평가 결과 (요약, 전체 점수, 카테고리별 점수)
     */
    SummaryResult generateSummary(Interview interview);
}

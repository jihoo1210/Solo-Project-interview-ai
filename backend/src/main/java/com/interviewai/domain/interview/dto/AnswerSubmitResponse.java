package com.interviewai.domain.interview.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AnswerSubmitResponse {

    private EvaluationResult evaluation;
    private QuestionResponse nextQuestion;

    public static AnswerSubmitResponse of(EvaluationResult evaluation, QuestionResponse nextQuestion) {
        return AnswerSubmitResponse.builder()
                .evaluation(evaluation)
                .nextQuestion(nextQuestion)
                .build();
    }
}

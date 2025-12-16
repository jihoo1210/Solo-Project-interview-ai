package com.interviewai.domain.interview.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EvaluationResult {

    private int score;
    private String feedback;
    private String modelAnswer;

    public static EvaluationResult of(int score, String feedback, String modelAnswer) {
        return EvaluationResult.builder()
                .score(score)
                .feedback(feedback)
                .modelAnswer(modelAnswer)
                .build();
    }
}

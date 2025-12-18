package com.interviewai.domain.interview.dto;

import com.interviewai.domain.interview.entity.*;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class InterviewDetailResponse {

    private Long id;
    private InterviewType type;
    private InterviewDifficulty difficulty;
    private InterviewStatus status;
    private Integer totalScore;
    private Map<String, Integer> categoryScores;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private List<QuestionWithAnswerResponse> questions;

    public static InterviewDetailResponse from(Interview interview) {
        return InterviewDetailResponse.builder()
                .id(interview.getId())
                .type(interview.getType())
                .difficulty(interview.getDifficulty())
                .status(interview.getStatus())
                .totalScore(interview.getTotalScore())
                .categoryScores(interview.getCategoryScores())
                .startedAt(interview.getStartedAt())
                .endedAt(interview.getEndedAt())
                .questions(interview.getQuestions().stream()
                        .map(QuestionWithAnswerResponse::from)
                        .toList())
                .build();
    }

    @Getter
    @Builder
    public static class QuestionWithAnswerResponse {
        private Long id;
        private String content;
        private Integer orderNumber;
        private String category;
        private AnswerResponse answer;

        public static QuestionWithAnswerResponse from(Question question) {
            return QuestionWithAnswerResponse.builder()
                    .id(question.getId())
                    .content(question.getContent())
                    .orderNumber(question.getOrderNumber())
                    .category(question.getCategory())
                    .answer(question.getAnswer() != null ? AnswerResponse.from(question.getAnswer()) : null)
                    .build();
        }
    }

    @Getter
    @Builder
    public static class AnswerResponse {
        private Long id;
        private String content;
        private Integer score;
        private String feedback;
        private String modelAnswer;
        private Integer answerTimeSeconds;

        public static AnswerResponse from(Answer answer) {
            return AnswerResponse.builder()
                    .id(answer.getId())
                    .content(answer.getContent())
                    .score(answer.getScore())
                    .feedback(answer.getFeedback())
                    .modelAnswer(answer.getModelAnswer())
                    .answerTimeSeconds(answer.getAnswerTimeSeconds())
                    .build();
        }
    }
}

package com.interviewai.domain.interview.dto;

import com.interviewai.domain.interview.entity.Interview;
import com.interviewai.domain.interview.entity.InterviewDifficulty;
import com.interviewai.domain.interview.entity.InterviewStatus;
import com.interviewai.domain.interview.entity.InterviewType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InterviewListResponse {

    private Long id;
    private InterviewType type;
    private InterviewDifficulty difficulty;
    private InterviewStatus status;
    private Integer totalScore;
    private Integer questionCount;
    private LocalDateTime createdAt;

    public static InterviewListResponse from(Interview interview) {
        return InterviewListResponse.builder()
                .id(interview.getId())
                .type(interview.getType())
                .difficulty(interview.getDifficulty())
                .status(interview.getStatus())
                .totalScore(interview.getTotalScore())
                .questionCount(interview.getQuestionCount())
                .createdAt(interview.getCreatedAt())
                .build();
    }
}

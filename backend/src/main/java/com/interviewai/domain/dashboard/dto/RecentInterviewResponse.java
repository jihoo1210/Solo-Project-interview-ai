package com.interviewai.domain.dashboard.dto;

import java.time.LocalDateTime;

import com.interviewai.domain.interview.entity.Interview;
import com.interviewai.domain.interview.entity.InterviewDifficulty;
import com.interviewai.domain.interview.entity.InterviewType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecentInterviewResponse {
    private Long id;
    private InterviewType type;
    private InterviewDifficulty difficulty;
    private Integer totalScore;
    private Integer questionCount;
    private LocalDateTime createdAt;

    public static RecentInterviewResponse from(Interview interview) {
        return RecentInterviewResponse.builder()
                .id(interview.getId())
                .type(interview.getType())
                .difficulty(interview.getDifficulty())
                .totalScore(interview.getTotalScore())
                .questionCount(interview.getQuestionCount())
                .createdAt(interview.getCreatedAt())
                .build();
    }
}

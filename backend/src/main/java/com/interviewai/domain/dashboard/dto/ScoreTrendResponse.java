package com.interviewai.domain.dashboard.dto;

import java.time.LocalDate;

import com.interviewai.domain.interview.entity.InterviewDifficulty;
import com.interviewai.domain.interview.entity.InterviewType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ScoreTrendResponse {
    private Long interviewId;
    private Integer score;
    private InterviewType type;
    private InterviewDifficulty difficulty;
    private LocalDate date;

    public static ScoreTrendResponse of(Long interviewId, Integer score, InterviewType type, InterviewDifficulty difficulty, LocalDate date) {
        return ScoreTrendResponse.builder()
                .interviewId(interviewId)
                .score(score)
                .type(type)
                .difficulty(difficulty)
                .date(date)
                .build();
    }
}

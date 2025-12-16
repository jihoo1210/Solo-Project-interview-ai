package com.interviewai.domain.interview.dto;

import com.interviewai.domain.interview.entity.Interview;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InterviewEndResponse {

    private Long interviewId;
    private Integer totalScore;
    private Integer questionCount;
    private SummaryResult summary;

    public static InterviewEndResponse of(Interview interview, SummaryResult summary) {
        return InterviewEndResponse.builder()
                .interviewId(interview.getId())
                .totalScore(interview.getTotalScore())
                .questionCount(interview.getQuestionCount())
                .summary(summary)
                .build();
    }
}

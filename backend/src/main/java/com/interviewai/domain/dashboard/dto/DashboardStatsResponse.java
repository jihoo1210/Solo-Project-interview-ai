package com.interviewai.domain.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardStatsResponse {
    private Long totalInterviews;        // 총 면접 횟수
    private Long completedInterviews;    // 완료된 면접 횟수
    private Integer averageScore;        // 평균 점수
    private Integer highestScore;        // 최고 점수
    private Integer lowestScore;         // 최저 점수
    private Long thisMonthCount;         // 이번 달 면접 횟수

    public static DashboardStatsResponse of(
            Long totalInterviews,
            Long completedInterviews,
            Double averageScore,
            Integer highestScore,
            Integer lowestScore,
            Long thisMonthCount) {

        return DashboardStatsResponse.builder()
                .totalInterviews(totalInterviews)
                .completedInterviews(completedInterviews)
                .averageScore(averageScore != null ? averageScore.intValue() : null)
                .highestScore(highestScore)
                .lowestScore(lowestScore)
                .thisMonthCount(thisMonthCount)
                .build();
    }
}
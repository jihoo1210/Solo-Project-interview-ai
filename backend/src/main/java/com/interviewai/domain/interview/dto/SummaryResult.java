package com.interviewai.domain.interview.dto;

import java.util.Map;

import lombok.Builder;
import lombok.Getter;

/**
 * 면접 종합 평가 결과 DTO
 * 레이더 차트용 카테고리별 점수 포함
 */
@Getter
@Builder
public class SummaryResult {

    /** 종합 평가 텍스트 */
    private String summary;

    /** 전체 평균 점수 (1-10) */
    private int overallScore;

    /** 카테고리별 점수 (레이더 차트용) */
    private Map<String, Integer> categoryScores;

    /**
     * 정적 팩토리 메서드
     */
    public static SummaryResult of(String summary, int overallScore, Map<String, Integer> categoryScores) {
        return SummaryResult.builder()
                .summary(summary)
                .overallScore(overallScore)
                .categoryScores(categoryScores)
                .build();
    }
}

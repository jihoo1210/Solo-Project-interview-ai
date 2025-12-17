package com.interviewai.domain.dashboard.dto;

import java.util.List;

import com.interviewai.domain.interview.entity.InterviewDifficulty;
import com.interviewai.domain.interview.entity.InterviewType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryAnalysisResponse {
    
    private List<TypeScore> byType;              // 유형별 점수
    private List<DifficultyScore> byDifficulty;  // 난이도별 점수
    private List<String> weakCategories;         // 약점 카테고리
    private List<String> strongCategories;       // 강점 카테고리

    @Getter
    @Builder
    public static class TypeScore {
        private InterviewType type;
        private Integer avgScore;
        private Long count;
    }

    @Getter
    @Builder
    public static class DifficultyScore {
        private InterviewDifficulty difficulty;
        private Integer avgScore;
        private Long count;
    }
}

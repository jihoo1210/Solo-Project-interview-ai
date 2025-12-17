package com.interviewai.domain.dashboard.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.interviewai.domain.dashboard.dto.CategoryAnalysisResponse;
import com.interviewai.domain.dashboard.dto.DashboardStatsResponse;
import com.interviewai.domain.dashboard.dto.RecentInterviewResponse;
import com.interviewai.domain.dashboard.dto.ScoreTrendResponse;
import com.interviewai.domain.dashboard.dto.CategoryAnalysisResponse.DifficultyScore;
import com.interviewai.domain.dashboard.dto.CategoryAnalysisResponse.TypeScore;
import com.interviewai.domain.interview.entity.Interview;
import com.interviewai.domain.interview.entity.InterviewDifficulty;
import com.interviewai.domain.interview.entity.InterviewStatus;
import com.interviewai.domain.interview.entity.InterviewType;
import com.interviewai.domain.interview.repository.InterviewRepository;
import com.interviewai.domain.user.entity.User;
import com.interviewai.domain.user.repository.UserRepository;
import com.interviewai.global.exception.CustomException;
import com.interviewai.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class DashboardService {
    
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    // 통계 조회
    public DashboardStatsResponse getStats(String email) {

        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

        long total = interviewRepository.countByUser(user);
        long completed = interviewRepository.countByUserAndStatus(user, InterviewStatus.COMPLETED);
        Double avgScore = interviewRepository.calculateAverageScore(user);
        Integer maxScore = interviewRepository.findMaxScore(user);
        Integer minScore = interviewRepository.findMinScore(user);

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1); // atStartOfDay() 없음
        long thisMonth = interviewRepository.countByUserAndCreatedAtGreaterThanEqual(user, startOfMonth);

        return DashboardStatsResponse.of(total, completed, avgScore, maxScore, minScore, thisMonth);
    }

    // 점수 추이 조회
    public List<ScoreTrendResponse> getScoreTrend(String email, int limit) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));
        Pageable pageable = PageRequest.of(0, limit);

        List<Interview> interviews = interviewRepository.findByUserAndStatusOrderByCreatedAtDesc(user, InterviewStatus.COMPLETED, pageable);

        return interviews.stream()
                .sorted(Comparator.comparing(Interview::getCreatedAt))
                .map(i -> ScoreTrendResponse.of(
                    i.getId(),
                    i.getTotalScore(),
                    i.getType(),
                    i.getDifficulty(),
                    i.getCreatedAt().toLocalDate()
                )).toList();
    }

    // 카테고리별 분석 조회
    public CategoryAnalysisResponse getCategoryAnalysis(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));;
        
        // 유형별 통계
        List<TypeScore> byType = interviewRepository.findStatsByType(user).stream()
                .map(row -> TypeScore.builder()
                        .type((InterviewType) row[0])
                        .avgScore(((Double) row[1]).intValue())
                        .count((Long) row[2])
                        .build())
                .toList();

        // 난이도별 통계
        List<DifficultyScore> byDifficulty = interviewRepository.findStatsByDifficulty(user).stream()
                .map(row -> DifficultyScore.builder()
                        .difficulty((InterviewDifficulty) row[0])
                        .avgScore(((Double) row[1]).intValue())
                        .count((Long) row[2])
                        .build())
                .toList();

        // 강약점 분석 (평균 7점 이상: 강점, 5점 이하: 약점)
        List<String> strong = byType.stream()
                .filter(t -> t.getAvgScore() >= 7)
                .map(t -> t.getType().getDescription())
                .toList();

        List<String> weak = byType.stream()
                .filter(t -> t.getAvgScore() <= 5)
                .map(t -> t.getType().getDescription())
                .toList();
        
        return CategoryAnalysisResponse.builder()
                .byType(byType)
                .byDifficulty(byDifficulty)
                .strongCategories(strong)
                .weakCategories(weak)
                .build();
    }

    // 최근 면접 목록 조회
    public List<RecentInterviewResponse> getRecentInterviews(String email, int limit) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));;
        Pageable pageable = PageRequest.of(0, limit);
        
        return interviewRepository
                .findByUserAndStatusOrderByCreatedAtDesc(user, InterviewStatus.COMPLETED, pageable)
                .stream()
                .map(RecentInterviewResponse::from)
                .toList();
    }
}

package com.interviewai.domain.dashboard.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewai.domain.dashboard.dto.CategoryAnalysisResponse;
import com.interviewai.domain.dashboard.dto.DashboardStatsResponse;
import com.interviewai.domain.dashboard.dto.RecentInterviewResponse;
import com.interviewai.domain.dashboard.dto.ScoreTrendResponse;
import com.interviewai.domain.dashboard.service.DashboardService;
import com.interviewai.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashBoardController {
    
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        return ApiResponse.success(dashboardService.getStats(email));
    }

    @GetMapping("/score-trend")
    public ApiResponse<List<ScoreTrendResponse>> getScoreTrend(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "10", name = "limit") int limit) {
        return ApiResponse.success(dashboardService.getScoreTrend(userDetails.getUsername(), limit));
    }

    @GetMapping("/category-analysis")
    public ApiResponse<CategoryAnalysisResponse> getCategoryAnalysis(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.success(dashboardService.getCategoryAnalysis(userDetails.getUsername()));
    }

    @GetMapping("/recent")
    public ApiResponse<List<RecentInterviewResponse>> getRecentInterviews(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "5", name = "limit") int limit) {
        return ApiResponse.success(dashboardService.getRecentInterviews(userDetails.getUsername(), limit));
    }
    
    
    
}

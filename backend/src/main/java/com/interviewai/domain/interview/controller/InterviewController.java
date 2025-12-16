package com.interviewai.domain.interview.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewai.domain.interview.dto.AnswerSubmitRequest;
import com.interviewai.domain.interview.dto.AnswerSubmitResponse;
import com.interviewai.domain.interview.dto.InterviewDetailResponse;
import com.interviewai.domain.interview.dto.InterviewEndResponse;
import com.interviewai.domain.interview.dto.InterviewListResponse;
import com.interviewai.domain.interview.dto.InterviewResumeResponse;
import com.interviewai.domain.interview.dto.InterviewStartRequest;
import com.interviewai.domain.interview.dto.InterviewStartResponse;
import com.interviewai.domain.interview.service.InterviewService;
import com.interviewai.global.common.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;



@RequiredArgsConstructor
@RestController
@RequestMapping("/api/interviews")
public class InterviewController {
    
    private final InterviewService interviewService;

    @PostMapping
    public ApiResponse<InterviewStartResponse> startInterview(@AuthenticationPrincipal UserDetails userdetails, @RequestBody @Valid InterviewStartRequest request) {
        String email = userdetails.getUsername();
        return ApiResponse.success(interviewService.startInterview(email, request));
    }

    @PostMapping("/{id}/answers")
    public ApiResponse<AnswerSubmitResponse> submitAnswer(@AuthenticationPrincipal UserDetails userDetails, @PathVariable("id") Long id, @RequestBody @Valid AnswerSubmitRequest request) {
        String email = userDetails.getUsername();
        return ApiResponse.success(interviewService.submitAnswer(email, id, request));
    }

    @PostMapping("/{id}/end")
    public ApiResponse<InterviewEndResponse> endInterview(@AuthenticationPrincipal UserDetails userDetails, @PathVariable("id") Long id) {
        String email = userDetails.getUsername();
        return ApiResponse.success(interviewService.endInterview(email, id));
    }

    @GetMapping
    public ApiResponse<Page<InterviewListResponse>> getInterviewList(@AuthenticationPrincipal UserDetails userDetails, @PageableDefault(size = 10, sort = "id", direction = Direction.DESC) Pageable pageable) {
        String email = userDetails.getUsername();
        return ApiResponse.success(interviewService.getInterviewList(email, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<InterviewDetailResponse> getInterviewDetail(@AuthenticationPrincipal UserDetails userDetails, @PathVariable("id") Long id) {
        String email = userDetails.getUsername();
        return ApiResponse.success(interviewService.getInterviewDetail(email, id));
    }

    @GetMapping("/today-count")
    public ApiResponse<Long> getTodayInterviewCount(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        return ApiResponse.success(interviewService.getTodayInterviewCount(email));
    }

    @PostMapping("/{id}/resume")
    public ApiResponse<InterviewResumeResponse> resumeInterview(@AuthenticationPrincipal UserDetails userDetails, @PathVariable("id") Long id) {
        String email = userDetails.getUsername();
        return ApiResponse.success(interviewService.resumeInterview(email, id));
    }
}

package com.interviewai.domain.user.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewai.domain.user.dto.LoginResponse;
import com.interviewai.domain.user.dto.OAuthGoogleLoginRequest;
import com.interviewai.domain.user.dto.OAuthNaverLoginRequest;
import com.interviewai.domain.user.service.OAuthService;
import com.interviewai.global.common.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/oauth")
public class OAuthController {
    
    private final OAuthService oAuthService;

    @PostMapping("/google")
    public ApiResponse<LoginResponse> googleLogin(@RequestBody @Valid OAuthGoogleLoginRequest request) {
        
        return ApiResponse.success(oAuthService.googleLogin(request.getCode()));
    }

    @PostMapping("/naver")
    public ApiResponse<LoginResponse> naverLogin(@RequestBody @Valid OAuthNaverLoginRequest request) {

        return ApiResponse.success(oAuthService.naverLogin(request.getCode(), request.getState()));
    }
    
    
}

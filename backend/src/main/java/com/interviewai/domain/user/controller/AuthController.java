package com.interviewai.domain.user.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interviewai.domain.user.dto.LoginRequest;
import com.interviewai.domain.user.dto.LoginResponse;
import com.interviewai.domain.user.dto.ResendVerificationRequest;
import com.interviewai.domain.user.dto.SignupRequest;
import com.interviewai.domain.user.dto.SignupResponse;
import com.interviewai.domain.user.dto.TokenRefreshRequest;
import com.interviewai.domain.user.dto.TokenRefreshResponse;
import com.interviewai.domain.user.service.AuthService;
import com.interviewai.global.common.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ApiResponse<SignupResponse> signup(@RequestBody @Valid SignupRequest request) {
        return ApiResponse.<SignupResponse>success(authService.signup(request));
    }

    @GetMapping("/verify-email")
    public ApiResponse<Void> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ApiResponse.success();
    }

    @PostMapping("/resend-verification")
    public ApiResponse<Void> resendVerification(@RequestBody @Valid ResendVerificationRequest request) {
        authService.resendVerificationEmail(request.getEmail());
        return ApiResponse.success();
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<TokenRefreshResponse> refresh(@RequestBody @Valid TokenRefreshRequest request) {
        return ApiResponse.success(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody @Valid TokenRefreshRequest request) {
        authService.logout(request);
        return  ApiResponse.success();
    }
}
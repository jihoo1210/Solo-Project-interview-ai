package com.interviewai.domain.user.controller;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interviewai.domain.user.dto.DeleteAccountRequest;
import com.interviewai.domain.user.dto.LoginRequest;
import com.interviewai.domain.user.dto.LoginResponse;
import com.interviewai.domain.user.dto.PasswordResetConfirmRequest;
import com.interviewai.domain.user.dto.PasswordResetRequest;
import com.interviewai.domain.user.dto.ResendVerificationRequest;
import com.interviewai.domain.user.dto.SignupRequest;
import com.interviewai.domain.user.dto.SignupResponse;
import com.interviewai.domain.user.dto.TokenRefreshRequest;
import com.interviewai.domain.user.dto.TokenRefreshResponse;
import com.interviewai.domain.user.service.AuthService;
import com.interviewai.global.common.ApiResponse;

import jakarta.servlet.http.HttpServletResponse;
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
    public void verifyEmail(@RequestParam("token") String token, HttpServletResponse response) throws IOException {
        try {
            authService.verifyEmail(token);
            response.sendRedirect("http://localhost:5173/verify-email?success=true");
        } catch (Exception e) {
            String errorMessage = URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            response.sendRedirect("http://localhost:5173/verify-email?success=false&error=" + errorMessage);
        }
    }

    @PostMapping("/resend-verification")
    public ApiResponse<Void> resendVerification(@RequestBody @Valid ResendVerificationRequest request) {
        authService.resendVerificationEmail(request.getEmail());
        return ApiResponse.success();
    }

    @PostMapping("/password-reset")
    public ApiResponse<Void> passwordReset(@RequestBody @Valid PasswordResetRequest request) {
        authService.requestPasswordReset(request);
        return ApiResponse.success();
    }

    @PostMapping("/confirm-password-reset")
    public ApiResponse<LoginResponse> passwordResetConfirm(@RequestBody @Valid PasswordResetConfirmRequest request) {
        return ApiResponse.success(authService.confirmPasswordReset(request));
    }

    @PostMapping("/resend-password-reset")
    public ApiResponse<Void> resendPasswordReset(@RequestBody @Valid PasswordResetRequest request) {
        authService.resendPasswordResetEmail(request.getEmail());
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
        return ApiResponse.success();
    }

    @PostMapping("/delete-account")
    public ApiResponse<Void> deleteAccount(@RequestBody @Valid DeleteAccountRequest request) {
        authService.requestDeleteAccount(request);
        return ApiResponse.success();
    }
    
    @GetMapping("/confirm-delete-account")
    public ApiResponse<Void> confirmDeleteAccount(@RequestParam String token) {
        authService.confirmDeleteAccount(token);
        return ApiResponse.success();
    }
}
package com.interviewai.domain.user.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewai.domain.user.dto.ChangePasswordRequest;
import com.interviewai.domain.user.dto.LoginResponse;
import com.interviewai.domain.user.dto.UpdateProfileRequest;
import com.interviewai.domain.user.dto.UserResponse;
import com.interviewai.domain.user.service.UserService;
import com.interviewai.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        return ApiResponse.success(userService.getMyProfile(email));
    }

    @PostMapping("/me")
    public ApiResponse<UserResponse> updateProfile(@AuthenticationPrincipal UserDetails userDetails, @RequestBody UpdateProfileRequest request) {
        String email = userDetails.getUsername();
        return ApiResponse.success(userService.updateProfile(email, request));
    }

    @PatchMapping("/me/password")
    public ApiResponse<LoginResponse> changePassword(@AuthenticationPrincipal UserDetails userDetails, @RequestBody ChangePasswordRequest request) {
        String email = userDetails.getUsername();
        return ApiResponse.success(userService.changePassword(email, request));
    }
    
    
}

package com.interviewai.domain.user.dto;

import lombok.Builder;

@Builder
public record ForgotPasswordResponse(String token, String newPassword) {
}
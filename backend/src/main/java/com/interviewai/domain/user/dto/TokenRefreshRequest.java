package com.interviewai.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class TokenRefreshRequest {
    
    @NotBlank
    String refreshToken;
}

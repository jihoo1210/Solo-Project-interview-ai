package com.interviewai.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class ResendVerificationRequest {
    
    @NotBlank
    @Email
    @Size(max = 100, min = 10)
    String email;
}

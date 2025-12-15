package com.interviewai.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ResendVerificationRequest {
    
    @NotBlank
    @Email
    @Size(max = 100, min = 10)
    String email;
}

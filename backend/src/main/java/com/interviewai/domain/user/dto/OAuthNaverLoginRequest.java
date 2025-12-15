package com.interviewai.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class OAuthNaverLoginRequest {
    
    @NotBlank
    private String code;

    @NotBlank
    private String state;
}

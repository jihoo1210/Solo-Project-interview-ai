package com.interviewai.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class PasswordResetConfirmRequest {

    @NotBlank
    String token;
    
    @NotBlank
    @Size(max = 50, min = 8)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,}).*$")
    @JsonProperty("new_password")
    String newPassword;
}
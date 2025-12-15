package com.interviewai.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SignupRequest {
    
    @NotBlank
    @Email
    @Size(max = 100, min = 10)
    String email;

    @NotBlank
    @Size(max = 50)
    String nickname;
    
    @NotBlank
    @Size(max = 50, min = 8)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,}).*$")
    String password;
}

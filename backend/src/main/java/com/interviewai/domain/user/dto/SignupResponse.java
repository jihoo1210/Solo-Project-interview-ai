package com.interviewai.domain.user.dto;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class SignupResponse {
    
    UserResponse user;
    String message;

    public static SignupResponse of(UserResponse user, String message) {
        return SignupResponse.builder()
                .user(user)
                .message(message)
                .build();
    }
}

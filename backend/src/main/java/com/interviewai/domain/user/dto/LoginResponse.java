package com.interviewai.domain.user.dto;

import com.interviewai.domain.user.entity.User;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class LoginResponse {
    
    String email;
    String nickname;
    String accessToken;
    String refreshToken;

    public static LoginResponse of(User user, String accessToken, String refreshToken) {
        return LoginResponse.builder()
                            .email(user.getEmail())
                            .nickname(user.getNickname())
                            .accessToken(accessToken)
                            .refreshToken(refreshToken)
                            .build();
    }
}

package com.interviewai.domain.user.dto;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class TokenRefreshResponse {
    
    String accessToken;
    String refreshToken;

    public static TokenRefreshResponse of(String accessToken, String refreshToken) {
        return TokenRefreshResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .build();
    }
}

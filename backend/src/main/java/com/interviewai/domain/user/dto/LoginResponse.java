package com.interviewai.domain.user.dto;

import com.interviewai.domain.user.entity.User;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class LoginResponse {

    UserInfo user;
    String accessToken;
    String refreshToken;

    @Builder(builderMethodName = "userInfoBuilder")
    @Value
    public static class UserInfo {
        Long id;
        String email;
        String nickname;
        String profileImage;
        String subscriptionType;
        String subscriptionExpiresAt;
        boolean emailVerified;
        String provider;
        String createdAt;
    }

    
    public static LoginResponse of(User user, String accessToken, String refreshToken) {
        UserInfo userInfo = UserInfo.userInfoBuilder()
                                    .id(user.getId())
                                    .email(user.getEmail())
                                    .nickname(user.getNickname())
                                    .profileImage(user.getProfileImage())
                                    .subscriptionType(user.getSubscriptionType().name())
                                    .subscriptionExpiresAt(user.getSubscriptionExpiresAt() != null
                                        ? user.getSubscriptionExpiresAt().toString() : null)
                                    .emailVerified(user.isEmailVerified())
                                    .provider(user.getProvider().name())
                                    .createdAt(user.getCreatedAt().toString())
                                    .build();

        return LoginResponse.builder()
                            .user(userInfo)
                            .accessToken(accessToken)
                            .refreshToken(refreshToken)
                            .build();
    }
}
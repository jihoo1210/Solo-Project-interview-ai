package com.interviewai.domain.user.dto;

import java.time.LocalDateTime;

import com.interviewai.domain.user.entity.AuthProvider;
import com.interviewai.domain.user.entity.SubscriptionType;
import com.interviewai.domain.user.entity.User;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class UserResponse {
    Long id;
    String email;
    String nickname;
    String profileImage;
    boolean emailVerified;
    AuthProvider provider;
    SubscriptionType subscriptionType;
    LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .nickname(user.getNickname())
            .profileImage(user.getProfileImage())
            .emailVerified(user.isEmailVerified())
            .provider(user.getProvider())
            .subscriptionType(user.getSubscriptionType())
            .createdAt(user.getCreatedAt())
            .build();
    }
}

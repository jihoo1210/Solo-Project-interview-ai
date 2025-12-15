package com.interviewai.infra.oauth.naver.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class NaverUserInfo {
    
    String resultcode;
    String message;
    NaverResponse response;

    @Getter
    @NoArgsConstructor
    public static class NaverResponse {
        String id;
        String nickname;
        String name;
        String email;

        @JsonProperty("profile_image")
        String profileImage;
    }
}

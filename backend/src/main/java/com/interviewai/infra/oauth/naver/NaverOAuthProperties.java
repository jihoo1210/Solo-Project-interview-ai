package com.interviewai.infra.oauth.naver;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "oauth2.naver")
public class NaverOAuthProperties {
    
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private List<String> scope;
    private String tokenUri;
    private String userInfoUri;
}

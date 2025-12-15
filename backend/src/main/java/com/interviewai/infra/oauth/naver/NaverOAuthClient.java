package com.interviewai.infra.oauth.naver;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.interviewai.infra.oauth.naver.dto.NaverTokenResponse;
import com.interviewai.infra.oauth.naver.dto.NaverUserInfo;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class NaverOAuthClient {

    private final NaverOAuthProperties naverOAuthProperties;
    private final RestTemplate restTemplate;

    // 찾아보니 Token - GET or POST 요청 + state 값 필수
    public NaverTokenResponse getToken(String code, String state) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", naverOAuthProperties.getClientId());
        params.add("client_secret", naverOAuthProperties.getClientSecret());
        params.add("code", code);
        params.add("state", state); // state: URL 인코딩 값

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        return restTemplate.postForObject(naverOAuthProperties.getTokenUri(), request, NaverTokenResponse.class);
    }

    public NaverUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<NaverUserInfo> response = restTemplate.exchange(naverOAuthProperties.getUserInfoUri(), HttpMethod.GET, request, NaverUserInfo.class);
        return response.getBody();
    }
}

package com.interviewai.domain.user.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.interviewai.domain.user.dto.LoginResponse;
import com.interviewai.domain.user.entity.AuthProvider;
import com.interviewai.domain.user.entity.SubscriptionType;
import com.interviewai.domain.user.entity.User;
import com.interviewai.domain.user.repository.UserRepository;
import com.interviewai.global.exception.CustomException;
import com.interviewai.global.exception.ErrorCode;
import com.interviewai.global.security.jwt.JwtTokenProvider;
import com.interviewai.infra.oauth.google.GoogleOAuthClient;
import com.interviewai.infra.oauth.google.dto.GoogleTokenResponse;
import com.interviewai.infra.oauth.google.dto.GoogleUserInfo;
import com.interviewai.infra.oauth.naver.NaverOAuthClient;
import com.interviewai.infra.oauth.naver.dto.NaverTokenResponse;
import com.interviewai.infra.oauth.naver.dto.NaverUserInfo;
import com.interviewai.infra.redis.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class OAuthService {

    private final GoogleOAuthClient googleOAuthClient;
    private final NaverOAuthClient naverOAuthClient;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public LoginResponse googleLogin(String code) {
        // 1. 토큰 발급
        GoogleTokenResponse tokenResponse = googleOAuthClient.getToken(code);
        if (tokenResponse == null || tokenResponse.getAccessToken() == null) {
            throw new CustomException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }
    
        // 2. 사용자 정보 조회
        GoogleUserInfo userInfo = googleOAuthClient.getUserInfo(tokenResponse.getAccessToken());
        if (userInfo == null) {
            throw new CustomException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }
    
        // 3. 회원 조회 또는 생성
        User user = userRepository.findByEmail(userInfo.getEmail())
            .orElseGet(() -> createGoogleUser(userInfo));
    
        // 4. JWT 발급
        String accessToken = jwtTokenProvider.createJWT(user.getId(), user.getEmail(), user.getSubscriptionType());
        String refreshToken = jwtTokenProvider.createRefreshToken();
    
        // 5. RT 저장
        refreshTokenRepository.save(refreshToken, user.getId());
    
        return LoginResponse.of(user, accessToken, refreshToken);
    }

    public LoginResponse naverLogin(String code, String state) {
        NaverTokenResponse tokenResponse = naverOAuthClient.getToken(code, state);
        if (tokenResponse == null || tokenResponse.getAccessToken() == null) {
            throw new CustomException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }

        NaverUserInfo userInfo = naverOAuthClient.getUserInfo(tokenResponse.getAccessToken());
        if (userInfo == null) {
            throw new CustomException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }

        User user = userRepository.findByEmail(userInfo.getResponse().getEmail())
            .orElseGet(() -> createNaverUser(userInfo.getResponse()));
        
        String accessToken = jwtTokenProvider.createJWT(user.getId(), user.getEmail(), user.getSubscriptionType());
        String refreshToken = jwtTokenProvider.createRefreshToken();

        refreshTokenRepository.save(refreshToken, user.getId());

        return LoginResponse.of(user, accessToken, refreshToken);
    }
    
    private User createGoogleUser(GoogleUserInfo userInfo) {
        User user = User.builder()
            .email(userInfo.getEmail())
            .nickname(userInfo.getName())
            .profileImage(userInfo.getPicture())
            .provider(AuthProvider.GOOGLE)
            .subscriptionType(SubscriptionType.FREE)
            .emailVerified(true)
            .build();
        return userRepository.save(user);
    }

    private User createNaverUser(NaverUserInfo.NaverResponse userInfo) {
        User user = User.builder()
            .email(userInfo.getEmail())
            .nickname(userInfo.getNickname())
            .profileImage(userInfo.getProfileImage())
            .provider(AuthProvider.NAVER)
            .subscriptionType(SubscriptionType.FREE)
            .emailVerified(true)
            .build();
        return userRepository.save(user);
    }
}

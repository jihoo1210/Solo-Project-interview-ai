package com.interviewai.domain.user.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.interviewai.domain.user.dto.ChangePasswordRequest;
import com.interviewai.domain.user.dto.LoginResponse;
import com.interviewai.domain.user.dto.UpdateProfileRequest;
import com.interviewai.domain.user.dto.UserResponse;
import com.interviewai.domain.user.entity.User;
import com.interviewai.domain.user.repository.UserRepository;
import com.interviewai.global.exception.CustomException;
import com.interviewai.global.exception.ErrorCode;
import com.interviewai.global.security.jwt.JwtTokenProvider;
import com.interviewai.infra.redis.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    public UserResponse getMyProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));
        return UserResponse.from(user);
    }

    @Transactional(readOnly = false)
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));
        user.updateProfile(request);
        return UserResponse.from(user);
    }

    @Transactional(readOnly = false)
    public LoginResponse changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));
        if(!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }
        user.resetPassword(passwordEncoder.encode(request.getNewPassword()));

        String accessToken = jwtTokenProvider.createJWT(user.getId(), email, user.getSubscriptionType());
        String refreshToken = jwtTokenProvider.createRefreshToken();

        refreshTokenRepository.save(refreshToken, user.getId());

        return LoginResponse.of(user, accessToken, refreshToken);
    }
}

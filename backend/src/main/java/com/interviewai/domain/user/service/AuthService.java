package com.interviewai.domain.user.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.interviewai.domain.user.dto.LoginRequest;
import com.interviewai.domain.user.dto.LoginResponse;
import com.interviewai.domain.user.dto.PasswordResetConfirmRequest;
import com.interviewai.domain.user.dto.PasswordResetRequest;
import com.interviewai.domain.user.dto.SignupRequest;
import com.interviewai.domain.user.dto.SignupResponse;
import com.interviewai.domain.user.dto.TokenRefreshRequest;
import com.interviewai.domain.user.dto.TokenRefreshResponse;
import com.interviewai.domain.user.dto.UserResponse;
import com.interviewai.domain.user.entity.AuthProvider;
import com.interviewai.domain.user.entity.EmailVerification;
import com.interviewai.domain.user.entity.PasswordResetToken;
import com.interviewai.domain.user.entity.SubscriptionType;
import com.interviewai.domain.user.entity.User;
import com.interviewai.domain.user.repository.EmailVerificationRepository;
import com.interviewai.domain.user.repository.PasswordResetTokenRepository;
import com.interviewai.domain.user.repository.UserRepository;
import com.interviewai.global.exception.CustomException;
import com.interviewai.global.exception.ErrorCode;
import com.interviewai.global.security.jwt.JwtTokenProvider;
import com.interviewai.infra.mail.EmailService;
import com.interviewai.infra.mail.EmailType;
import com.interviewai.infra.redis.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * 회원가입
     * @param request
     * @return
     */
    @Transactional(readOnly = false)
    public SignupResponse signup(SignupRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        String nickname = request.getNickname();

        // 1. 이메일 중복 검사
        if(emailDuplicateCheck(email)) throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        
        // 2. 비밀번호 암호화
        String encodedPassword = encodePassword(password);

        // 3. User 저장
        SignupResponse response = createAndSaveUser(email, encodedPassword, nickname);

        // 4. 토큰 생성
        String token = emailService.generateEmailToken(EmailType.VERIFICATION);

        // 5. 인증 이메일 발송
        emailService.sendVerificationEmail(email, token);

        // 6. 응답 반환
        return response;
    }

    /**
     * 이메일 인증(회원가입)
     * @param token
     */
    @Transactional(readOnly = false)
    public void verifyEmail(String token) {
        EmailVerification emailVerification = emailVerificationRepository.findByToken(token).orElseThrow(() -> new CustomException(ErrorCode.INVALID_VERIFICATION_TOKEN));

        if((LocalDateTime.now().isAfter(emailVerification.getExpiresAt()))
            || emailVerification.isUsed()) {
            throw new CustomException(ErrorCode.TOKEN_EXPIRED);
        }

        emailVerification.getUser().verifyEmail();
        emailVerification.markAsUsed();
    }

    /**
     * 이메일 재전송(회원가입)
     * @param email
     */
    @Transactional(readOnly = false)
    public void resendVerificationEmail(String email) {

        // 1. 이전 토큰 사용 처리
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));
        EmailVerification emailVerification = emailVerificationRepository.findByUserAndUsedFalse(user).orElseThrow(() -> new CustomException(ErrorCode.INVALID_VERIFICATION_TOKEN));
        emailVerification.markAsUsed();
        
        // 2. 토큰 생성
        String token = emailService.generateEmailToken(EmailType.VERIFICATION);

        // 3. 인증 이메일 발송
        emailService.sendVerificationEmail(email, token);
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

        // 1. 비밀번호 일치 검사(해당 이메일이 실제로 존재한다는 정보를 노출하지 않음)
        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) throw new CustomException(ErrorCode.INVALID_CREDENTIALS);

        // 2. 이메일 인증된 회원 검사
        if(!user.isEmailVerified()) throw new CustomException(ErrorCode.EMAIL_NOT_VERIFIED);

        // 3. 토큰 발급
        String accessToken = jwtTokenProvider.createJWT(user.getId(), email, user.getSubscriptionType());
        String refreshToken = jwtTokenProvider.createRefreshToken();
        refreshTokenRepository.save(refreshToken, user.getId());
        
        return LoginResponse.of(user, accessToken, refreshToken);
    }

    public TokenRefreshResponse refresh(TokenRefreshRequest request) {
        String userId = refreshTokenRepository.findByRefreshToken(request.getRefreshToken());
        if(userId == null) throw new CustomException(ErrorCode.INVALID_TOKEN);

        User user = userRepository.findById(Long.parseLong(userId)).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

        String accessToken = jwtTokenProvider.createJWT(user.getId(), user.getEmail(), user.getSubscriptionType());
        String refreshToken = jwtTokenProvider.createRefreshToken();

        // 이전 RT 삭제
        refreshTokenRepository.deleteByRefreshToken(request.getRefreshToken());
        refreshTokenRepository.save(refreshToken, user.getId());

        return TokenRefreshResponse.of(accessToken, refreshToken);
    }

    public void logout(TokenRefreshRequest request) {
        if(!refreshTokenRepository.deleteByRefreshToken(request.getRefreshToken())) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }
    }

    public void requestPasswordReset(PasswordResetRequest request) {
        if(userRepository.existsByEmail(request.getEmail())) {
            String token = emailService.generateEmailToken(EmailType.PASSWORD_RESET);
            emailService.sendPasswordResetEmail(request.getEmail(), token);
        }
    }

    // 비밀번호 변경 -> 자동 로그인
    @Transactional(readOnly = false)
    public LoginResponse confirmPasswordReset(PasswordResetConfirmRequest request) {
        
        // 1. 토큰 조회 + 검증
        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(request.getToken()).orElseThrow(() -> new CustomException(ErrorCode.INVALID_VERIFICATION_TOKEN));
        if(!passwordResetToken.isValid()) throw new CustomException(ErrorCode.INVALID_VERIFICATION_TOKEN);
        
        // 2. 비밀번호 변경
        User user = passwordResetToken.getUser();
        user.resetPassword(passwordEncoder.encode(request.getNewPassword()));

        // 3. 토큰 사용 처리
        passwordResetToken.markAsUsed();

        // 4. JWT 발급 + RT 저장
        String accessToken = jwtTokenProvider.createJWT(user.getId(), user.getEmail(), user.getSubscriptionType());
        String refreshToken = jwtTokenProvider.createRefreshToken();

        refreshTokenRepository.save(refreshToken, user.getId());

        return LoginResponse.of(user, accessToken, refreshToken);
    }

    @Transactional(readOnly = false)
    public void resendPasswordResetEmail(String email) {
        // 1. 이전 토큰 사용 처리
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));
        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByUserAndUsedFalse(user).orElseThrow(() -> new CustomException(ErrorCode.INVALID_VERIFICATION_TOKEN));
        passwordResetToken.markAsUsed();
        
        // 2. 토큰 생성
        String token = emailService.generateEmailToken(EmailType.PASSWORD_RESET);

        // 3. 인증 이메일 발송
        emailService.sendPasswordResetEmail(email, token);
    }

    private boolean emailDuplicateCheck(String email) {
        return userRepository.existsByEmail(email);
    }
    
    private String encodePassword(String password) {
        return passwordEncoder.encode(password);
    }

    private SignupResponse createAndSaveUser(String email, String encodedPassword, String nickname) {
        User user = User.builder()
                        .email(email)
                        .password(encodedPassword)
                        .nickname(nickname)
                        .provider(AuthProvider.LOCAL)
                        .subscriptionType(SubscriptionType.FREE)
                        .emailVerified(false)
                        .build();
        User savedUser = userRepository.save(user);
        return SignupResponse.of(UserResponse.from(savedUser), "회원가입 완료");
    }
}
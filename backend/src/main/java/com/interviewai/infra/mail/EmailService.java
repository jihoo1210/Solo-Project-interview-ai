package com.interviewai.infra.mail;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.interviewai.domain.user.entity.EmailVerification;
import com.interviewai.domain.user.entity.PasswordResetToken;
import com.interviewai.domain.user.entity.User;
import com.interviewai.domain.user.repository.EmailVerificationRepository;
import com.interviewai.domain.user.repository.PasswordResetTokenRepository;
import com.interviewai.domain.user.repository.UserRepository;
import com.interviewai.global.exception.CustomException;
import com.interviewai.global.exception.ErrorCode;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class EmailService {
    
    private final JavaMailSender javaMailSender;
    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${spring.mail.username}") private String mailSender;

    public void sendVerificationEmail(String email, String token) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(message);
            messageHelper.setTo(email);
            messageHelper.setSubject("[INTERVIEW AI] Membership registration email verification code");
            messageHelper.setText(getRegistrationEmailHtml(token), true);
            messageHelper.setFrom(mailSender);
            javaMailSender.send(message);
        } catch(MessagingException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));
        EmailVerification emailVerification = EmailVerification.builder()
                                                            .user(user)
                                                            .token(token)
                                                            .expiresAt(LocalDateTime.now().plusMinutes(10))
                                                            .build();
        emailVerificationRepository.save(emailVerification);
    }
    public void sendPasswordResetEmail(String email, String token) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(message);
            messageHelper.setTo(email);
            messageHelper.setSubject("[INTERVIEW AI] Password reset email verification code");
            messageHelper.setText(getRegistrationEmailHtml(token), true);
            messageHelper.setFrom(mailSender);
            javaMailSender.send(message);
        } catch(MessagingException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));
        PasswordResetToken emailVerification = PasswordResetToken.builder()
                                                            .user(user)
                                                            .token(token)
                                                            .expiresAt(LocalDateTime.now().plusMinutes(10))
                                                            .build();
        passwordResetTokenRepository.save(emailVerification);
    }
    public String generateVerificationEmailToken() {
        StringBuilder values = new StringBuilder();
        do {
            values.delete(0, values.length());
            for(int i = 0; i < 6; i++) {
                int value = (int) (Math.random() * 10);
                values.append(value);
            }
        } while (emailVerificationRepository.existsByToken(values.toString()));
        return values.toString();
    }

    private String getRegistrationEmailHtml(String token) {
        return "<div style='max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;'>"
        + "<h2 style='color: #333; text-align: center;'>AI 면접 시뮬레이터</h2>"
        + "<div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>"
        + "<h3 style='color: #333; text-align: center;'>이메일 인증</h3>"
        + "<p style='color: #666; line-height: 1.6; text-align: center;'>"
        + "안녕하세요! AI 면접 시뮬레이터에 가입해 주셔서 감사합니다.<br>아래 버튼을 클릭하여 이메일 인증을 완료해 주세요."
        + "</p>"
        + "<div style='text-align: center; margin: 30px 0;'>"
        + "<a href='http://localhost:8080/api/v1/auth/verify-email?token=" + token + "'"
        + "style='background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;'>"
        + "이메일 인증하기"
        + "</a>"
        + "</div>"
        + "<p style='color: #999; font-size: 12px;'>"
        + "본 메일은 발신 전용입니다.<br>인증 링크는 10분 후 만료됩니다."
        + "</p>"
        + "</div>"
        + "</div>";
    }
    private String getPasswordResetEmailHtml(String token) {
        return "<div style='max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;'>"
        + "<h2 style='color: #333; text-align: center;'>AI 면접 시뮬레이터</h2>"
        + "<div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>"
        + "<h3 style='color: #333; text-align: center;'>이메일 인증</h3>"
        + "<p style='color: #666; line-height: 1.6; text-align: center;'>"
        + "안녕하세요! AI 면접 시뮬레이터 비밀번호 재설정 링크입니다.<br>아래 버튼을 클릭하여 이메일 인증을 완료해 주세요."
        + "</p>"
        + "<div style='text-align: center; margin: 30px 0;'>"
        + "<a href='http://localhost:8080/api/v1/auth/verify-email?token=" + token + "'"
        + "style='background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;'>"
        + "이메일 인증하기"
        + "</a>"
        + "</div>"
        + "<p style='color: #999; font-size: 12px;'>"
        + "본 메일은 발신 전용입니다.<br>인증 링크는 10분 후 만료됩니다."
        + "</p>"
        + "</div>"
        + "</div>";
    }
}
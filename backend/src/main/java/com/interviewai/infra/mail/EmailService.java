package com.interviewai.infra.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.interviewai.domain.user.entity.User;
import com.interviewai.domain.user.repository.UserRepository;
import com.interviewai.global.exception.CustomException;
import com.interviewai.global.exception.ErrorCode;
import com.interviewai.infra.redis.EmailTokenRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final UserRepository userRepository;
    private final EmailTokenRepository emailTokenRepository;

    @Value("${spring.mail.username}")
    private String mailSender;

    // MAIN 
    public void sendVerificationEmail(String email, String token) {
        sendEmail(email, token, EmailType.VERIFICATION);
        saveEmailVerification(email, token);
    }

    public void sendPasswordResetEmail(String email, String token) {
        sendEmail(email, token, EmailType.PASSWORD_RESET);
        savePasswordResetToken(email, token);
    }

    public void sendDeleteAccountEmail(String email, String token) {
        sendEmail(email, token, EmailType.DELETE_ACCOUNT);
        savedDeleteAccountToken(email, token);
    }

    // UTIL
    public String generateEmailToken(EmailType emailType) { 
        StringBuilder values = new StringBuilder();
        do {
            values.delete(0, values.length());
            for (int i = 0; i < 6; i++) {
                int value = (int) (Math.random() * 10);
                values.append(value);
            }
        } while (existsToken(values.toString(), emailType));
        return values.toString();
    }
    private boolean existsToken(String token, EmailType emailType) {
        return switch (emailType) {
            case VERIFICATION -> emailTokenRepository.existsEmailVerificationToken(token);
            case PASSWORD_RESET -> emailTokenRepository.existsPasswordResetToken(token);
            case DELETE_ACCOUNT -> emailTokenRepository.existsDeleteAccountToken(token);
        };
    }

    private void sendEmail(String email, String token, EmailType type) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(message);
            messageHelper.setTo(email);
            messageHelper.setSubject(type.getSubject());
            messageHelper.setText(getEmailHtml(token, type), true);
            messageHelper.setFrom(mailSender);
            javaMailSender.send(message);
        } catch (MessagingException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    private void saveEmailVerification(String email, String token) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));
        emailTokenRepository.saveEmailVerificationToken(token, user.getId());
    }

    private void savePasswordResetToken(String email, String token) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));
        emailTokenRepository.savePasswordResetToken(token, user.getId());
    }

    private void savedDeleteAccountToken(String email, String token) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));
        emailTokenRepository.saveDeleteAccountToken(token, user.getId());
    }

    // HTML
    private String getEmailHtml(String token, EmailType type) {
        return """
            <div style='max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #FFFBF7;'>
                <div style='text-align: center; padding: 20px 0;'>
                    <h2 style='color: #FB923C; margin: 0; font-size: 24px;'>AI 면접 시뮬레이터</h2>
                    <p style='color: #FDBA74; margin: 5px 0 0 0; font-size: 14px;'>취업 면접 AI 코칭 서비스</p>
                </div>
                <div style='background-color: #FFFFFF; padding: 40px 30px; border-radius: 16px; box-shadow: 0 2px 8px rgba(251, 146, 60, 0.08);'>
                    <h3 style='color: #FB923C; text-align: center; margin: 0 0 20px 0; font-size: 20px;'>%s</h3>
                    <p style='color: #78716C; line-height: 1.8; text-align: center; margin: 0 0 30px 0;'>
                        %s
                    </p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='%s%s'
                           style='display: inline-block; background-color: #FB923C; color: white; padding: 14px 36px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;'>
                            %s
                        </a>
                    </div>
                    <div style='border-top: 1px solid #FED7AA; margin-top: 30px; padding-top: 20px;'>
                        <p style='color: #A8A29E; font-size: 12px; text-align: center; margin: 0;'>
                            본 메일은 발신 전용입니다.<br>
                            인증 링크는 10분 후 만료됩니다.
                        </p>
                    </div>
                </div>
                <div style='text-align: center; padding: 20px 0;'>
                    <p style='color: #D6D3D1; font-size: 11px; margin: 0;'>© 2024 AI 면접 시뮬레이터. All rights reserved.</p>
                </div>
            </div>
            """.formatted(
                type.getTitle(),
                type.getDescription(),
                type.getLinkPrefix(),
                token,
                type.getButtonText()
            );
    }
}

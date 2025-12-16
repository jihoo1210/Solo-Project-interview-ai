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
            <div style='max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;'>
                <h2 style='color: #333; text-align: center;'>AI 면접 시뮬레이터</h2>
                <div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>
                    <h3 style='color: #333; text-align: center;'>%s</h3>
                    <p style='color: #666; line-height: 1.6; text-align: center;'>
                        %s
                    </p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='%s%s'
                           style='background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;'>
                            %s
                        </a>
                    </div>
                    <p style='color: #999; font-size: 12px;'>
                        본 메일은 발신 전용입니다.<br>
                        인증 링크는 10분 후 만료됩니다.
                    </p>
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

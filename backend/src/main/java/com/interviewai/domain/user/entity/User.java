package com.interviewai.domain.user.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.util.StringUtils;

import com.interviewai.domain.payment.entity.PlanType;
import com.interviewai.domain.user.dto.UpdateProfileRequest;
import com.interviewai.global.common.BaseTimeEntity;
import com.interviewai.global.exception.CustomException;
import com.interviewai.global.exception.ErrorCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter

@Entity
@Table(name = "users")
public class User extends BaseTimeEntity {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String email;

    @Column(length = 255)
    private String password;

    @Column(length = 50)
    private String nickname;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @Column(name = "email_verified")
    private boolean emailVerified;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    @Column(name = "provider_id", length = 100)
    private String providerId;

    @Column(name = "subscription_type")
    @Enumerated(EnumType.STRING)
    private SubscriptionType subscriptionType;

    @Column(name = "subscription_expires_at")
    private LocalDateTime subscriptionExpiresAt;

    @Column(name = "billing_key", length = 200)
    private String billingKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", length = 20)
    private PlanType planType;

    @Column(name = "subscription_cancelled")
    private boolean subscriptionCancelled;

    @Column(name = "daily_interview_count")
    private int dailyInterviewCount;

    @Column(name = "last_interview_date")
    private LocalDate lastInterviewDate;

    public void verifyEmail() {
        this.emailVerified = true;
        this.emailVerifiedAt = LocalDateTime.now();
    }
    public void resetPassword(String newPassword) {
        this.password = newPassword;
    }

    public void updateProfile(UpdateProfileRequest request) {
        if(StringUtils.hasText(request.getNickname())) {
            this.nickname = request.getNickname();
        }
        if(StringUtils.hasText(request.getProfileImage())) {
            this.profileImage = request.getProfileImage();
        }
    }

    public void increaseAndCheckInterviewCount() {
        if(getDailyInterviewCount() > 4) {
            throw new CustomException(ErrorCode.PREMIUM_REQUIRED);
        }
        this.dailyInterviewCount = getDailyInterviewCount() + 1;
    }

    public void upgradeToPremium(LocalDateTime expiresAt, String billingKey, PlanType planType) {
        this.subscriptionType = SubscriptionType.PREMIUM;
        this.subscriptionExpiresAt = expiresAt;
        this.billingKey = billingKey;
        this.planType = planType;
        this.subscriptionCancelled = false;
        this.dailyInterviewCount = 0; // 횟수 초기화
    }

    public void cancelSubscription() {
        this.subscriptionCancelled = true;
    }

    public void downgradeToFree() {
        this.subscriptionType = SubscriptionType.FREE;
        this.subscriptionExpiresAt = null;
        this.billingKey = null;
        this.planType = null;
        this.subscriptionCancelled = false;
    }

    public void renewSubscription(LocalDateTime expiresAt) {
        this.subscriptionExpiresAt = expiresAt;
    }
}

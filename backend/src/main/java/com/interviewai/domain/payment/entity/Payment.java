package com.interviewai.domain.payment.entity;

import java.time.LocalDateTime;

import com.interviewai.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 100)
    private String orderId;

    @Column(length = 200)
    private String paymentKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PlanType planType;

    @Column(nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(length = 20)
    private String method;

    private LocalDateTime approvedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    private Payment(User user, String orderId, String paymentKey, PlanType planType,
                    Integer amount, PaymentStatus status, String method, LocalDateTime approvedAt) {
        this.user = user;
        this.orderId = orderId;
        this.paymentKey = paymentKey;
        this.planType = planType;
        this.amount = amount;
        this.status = status;
        this.method = method;
        this.approvedAt = approvedAt;
    }

    /**
     * 결제 완료 상태의 Payment 생성
     */
    public static Payment createCompleted(User user, String orderId, String paymentKey,
                                          PlanType planType, Integer amount, String method) {
        return Payment.builder()
                .user(user)
                .orderId(orderId)
                .paymentKey(paymentKey)
                .planType(planType)
                .amount(amount)
                .status(PaymentStatus.COMPLETED)
                .method(method)
                .approvedAt(LocalDateTime.now())
                .build();
    }

    /**
     * 결제 실패 상태의 Payment 생성
     */
    public static Payment createFailed(User user, String orderId, PlanType planType, Integer amount) {
        return Payment.builder()
                .user(user)
                .orderId(orderId)
                .planType(planType)
                .amount(amount)
                .status(PaymentStatus.FAILED)
                .build();
    }

    public void cancel() {
        this.status = PaymentStatus.CANCELLED;
    }
}

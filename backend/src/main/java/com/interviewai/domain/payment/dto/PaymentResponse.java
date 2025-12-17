package com.interviewai.domain.payment.dto;

import java.time.LocalDateTime;

import com.interviewai.domain.payment.entity.Payment;
import com.interviewai.domain.payment.entity.PaymentStatus;
import com.interviewai.domain.payment.entity.PlanType;

public record PaymentResponse(
    Long id,
    String orderId,
    PlanType planType,
    Integer amount,
    PaymentStatus status,
    String method,
    LocalDateTime approvedAt,
    LocalDateTime createdAt
) {
    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
            payment.getId(),
            payment.getOrderId(),
            payment.getPlanType(),
            payment.getAmount(),
            payment.getStatus(),
            payment.getMethod(),
            payment.getApprovedAt(),
            payment.getCreatedAt()
        );
    }
}

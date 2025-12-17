package com.interviewai.domain.payment.dto;

import java.time.LocalDateTime;

import com.interviewai.domain.payment.entity.PaymentStatus;

public record PaymentConfirmResponse(
    Long paymentId,
    PaymentStatus status,
    LocalDateTime subscriptionExpiresAt
) {}

package com.interviewai.domain.payment.dto;

public record TossPaymentConfirmRequest(
    String paymentKey,
    String orderId,
    int amount
) {}

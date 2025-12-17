package com.interviewai.domain.payment.dto;

public record TossBillingPaymentRequest(
        String customerKey,
        int amount,
        String orderId,
        String orderName
) {}

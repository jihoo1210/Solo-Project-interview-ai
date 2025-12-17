package com.interviewai.domain.payment.dto;

public record PaymentPrepareResponse(
    String orderId,
    Integer amount,
    String orderName,
    String customerEmail,
    String customerName
) {}

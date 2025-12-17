package com.interviewai.domain.payment.dto;

public record PaymentPrepareResponse(
    String customerKey,
    Integer amount,
    String orderName,
    String customerEmail,
    String customerName
) {}

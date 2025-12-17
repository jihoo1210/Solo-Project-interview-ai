package com.interviewai.domain.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TossPaymentResponse(
    String paymentKey,
    String orderId,
    String orderName,
    String status,
    String method,
    Integer totalAmount,
    String approvedAt,
    String requestedAt
) {}

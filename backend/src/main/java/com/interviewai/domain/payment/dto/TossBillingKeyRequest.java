package com.interviewai.domain.payment.dto;

public record TossBillingKeyRequest(
        String authKey,
        String customerKey
) {}

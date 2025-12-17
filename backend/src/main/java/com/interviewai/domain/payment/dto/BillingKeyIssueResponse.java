package com.interviewai.domain.payment.dto;

import java.time.LocalDateTime;

public record BillingKeyIssueResponse(
        Long paymentId,
        String cardNumber,
        LocalDateTime subscriptionExpiresAt
) {}

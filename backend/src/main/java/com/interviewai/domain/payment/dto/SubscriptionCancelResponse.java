package com.interviewai.domain.payment.dto;

import java.time.LocalDateTime;

public record SubscriptionCancelResponse(
        String message,
        LocalDateTime subscriptionExpiresAt
) {}

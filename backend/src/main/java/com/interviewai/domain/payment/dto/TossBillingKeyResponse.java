package com.interviewai.domain.payment.dto;

public record TossBillingKeyResponse(
        String billingKey,
        String customerKey,
        String authenticatedAt,
        String method,
        CardInfo card
) {
    public record CardInfo(
            String issuerCode,
            String acquirerCode,
            String number,
            String cardType,
            String ownerType
    ) {}
}

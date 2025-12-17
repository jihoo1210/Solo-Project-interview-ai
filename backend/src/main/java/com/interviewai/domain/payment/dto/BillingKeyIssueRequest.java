package com.interviewai.domain.payment.dto;

import jakarta.validation.constraints.NotBlank;

public record BillingKeyIssueRequest(
        @NotBlank(message = "authKey는 필수입니다")
        String authKey
) {}

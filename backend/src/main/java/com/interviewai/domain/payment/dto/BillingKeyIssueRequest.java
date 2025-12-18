package com.interviewai.domain.payment.dto;

import com.interviewai.domain.payment.entity.PlanType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BillingKeyIssueRequest(
        @NotBlank(message = "authKey는 필수입니다")
        String authKey,

        @NotNull(message = "planType은 필수입니다")
        PlanType planType
) {}

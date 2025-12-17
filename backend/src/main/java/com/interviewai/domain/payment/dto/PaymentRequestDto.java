package com.interviewai.domain.payment.dto;

import com.interviewai.domain.payment.entity.PlanType;

import jakarta.validation.constraints.NotNull;

public record PaymentRequestDto(
    @NotNull(message = "플랜 타입은 필수입니다.")
    PlanType planType
) {}

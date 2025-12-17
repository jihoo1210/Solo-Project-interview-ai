package com.interviewai.domain.payment.entity;

public enum PaymentStatus {
    COMPLETED("완료"),
    CANCELLED("취소"),
    FAILED("실패");

    private final String description;

    PaymentStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

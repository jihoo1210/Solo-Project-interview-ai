package com.interviewai.domain.interview.entity;

public enum InterviewStatus {
    IN_PROGRESS("진행 중"),
    COMPLETED("완료"),
    CANCELLED("취소됨");

    private final String description;

    InterviewStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

package com.interviewai.domain.interview.entity;

public enum InterviewType {
    FRONTEND("프론트엔드"),
    BACKEND("백엔드"),
    FULLSTACK("풀스택"),
    DEVOPS("데브옵스"),
    DATA("데이터"),
    MOBILE("모바일"),
    OTHER("기타");

    private final String description;

    InterviewType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

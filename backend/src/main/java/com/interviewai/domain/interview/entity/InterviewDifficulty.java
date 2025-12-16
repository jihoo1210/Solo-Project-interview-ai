package com.interviewai.domain.interview.entity;

public enum InterviewDifficulty {
    JUNIOR("주니어", "0-2년차"),
    MID("미드레벨", "3-5년차"),
    SENIOR("시니어", "6년차 이상");

    private final String label;
    private final String experience;

    InterviewDifficulty(String label, String experience) {
        this.label = label;
        this.experience = experience;
    }

    public String getLabel() {
        return label;
    }

    public String getExperience() {
        return experience;
    }
}

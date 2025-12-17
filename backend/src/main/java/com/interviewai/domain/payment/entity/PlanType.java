package com.interviewai.domain.payment.entity;

public enum PlanType {
    PREMIUM_MONTHLY("Premium 월간 구독", 9900, 30);

    private final String displayName;
    private final int price;
    private final int durationDays;

    PlanType(String displayName, int price, int durationDays) {
        this.displayName = displayName;
        this.price = price;
        this.durationDays = durationDays;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getPrice() {
        return price;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public String getOrderName() {
        return "AI 면접 시뮬레이터 " + displayName;
    }
}

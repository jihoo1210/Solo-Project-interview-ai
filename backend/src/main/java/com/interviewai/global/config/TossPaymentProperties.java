package com.interviewai.global.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "toss.payments")
public record TossPaymentProperties(
    String clientKey,
    String secretKey,
    String apiUrl
) {}

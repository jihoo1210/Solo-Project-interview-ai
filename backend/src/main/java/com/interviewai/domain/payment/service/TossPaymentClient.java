package com.interviewai.domain.payment.service;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.interviewai.domain.payment.dto.TossBillingKeyRequest;
import com.interviewai.domain.payment.dto.TossBillingKeyResponse;
import com.interviewai.domain.payment.dto.TossBillingPaymentRequest;
import com.interviewai.domain.payment.dto.TossPaymentResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class TossPaymentClient {

    private final RestClient tossPaymentRestClient;

    /**
     * 토스페이먼츠 빌링키 발급 API 호출
     */
    public TossBillingKeyResponse issueBillingKey(String authKey, String customerKey) {
        log.info("토스페이먼츠 빌링키 발급 요청 - customerKey: {}", customerKey);

        TossBillingKeyRequest request = new TossBillingKeyRequest(authKey, customerKey);

        TossBillingKeyResponse response = tossPaymentRestClient.post()
                .uri("/billing/authorizations/issue")
                .body(request)
                .retrieve()
                .body(TossBillingKeyResponse.class);

        log.info("토스페이먼츠 빌링키 발급 완료 - customerKey: {}", customerKey);
        return response;
    }

    /**
     * 토스페이먼츠 빌링키로 자동결제 API 호출
     */
    public TossPaymentResponse billingPayment(String billingKey, String customerKey,
                                               int amount, String orderId, String orderName) {
        log.info("토스페이먼츠 자동결제 요청 - customerKey: {}, orderId: {}, amount: {}", customerKey, orderId, amount);

        TossBillingPaymentRequest request = new TossBillingPaymentRequest(customerKey, amount, orderId, orderName);

        TossPaymentResponse response = tossPaymentRestClient.post()
                .uri("/billing/{billingKey}", billingKey)
                .body(request)
                .retrieve()
                .body(TossPaymentResponse.class);

        log.info("토스페이먼츠 자동결제 완료 - paymentKey: {}", response.paymentKey());
        return response;
    }

    /**
     * 토스페이먼츠 결제 취소 API 호출
     */
    public TossPaymentResponse cancelPayment(String paymentKey, String cancelReason) {
        log.info("토스페이먼츠 결제 취소 요청 - paymentKey: {}", paymentKey);

        record CancelRequest(String cancelReason) {}

        TossPaymentResponse response = tossPaymentRestClient.post()
                .uri("/payments/{paymentKey}/cancel", paymentKey)
                .body(new CancelRequest(cancelReason))
                .retrieve()
                .body(TossPaymentResponse.class);

        log.info("토스페이먼츠 결제 취소 완료 - paymentKey: {}", paymentKey);
        return response;
    }
}

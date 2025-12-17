package com.interviewai.domain.payment.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewai.domain.payment.dto.BillingKeyIssueRequest;
import com.interviewai.domain.payment.dto.BillingKeyIssueResponse;
import com.interviewai.domain.payment.dto.PaymentPrepareResponse;
import com.interviewai.domain.payment.dto.PaymentRequestDto;
import com.interviewai.domain.payment.dto.PaymentResponse;
import com.interviewai.domain.payment.dto.SubscriptionCancelResponse;
import com.interviewai.domain.payment.service.PaymentService;
import com.interviewai.global.common.ApiResponse;
import com.interviewai.global.config.TossPaymentProperties;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final TossPaymentProperties tossPaymentProperties;

    /**
     * 토스페이먼츠 클라이언트 키 조회
     */
    @GetMapping("/client-key")
    public ApiResponse<String> getClientKey() {
        return ApiResponse.success(tossPaymentProperties.clientKey());
    }

    /**
     * 결제 준비 (customerKey 생성)
     */
    @PostMapping("/prepare")
    public ApiResponse<PaymentPrepareResponse> preparePayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentRequestDto request
    ) {
        String email = userDetails.getUsername();
        PaymentPrepareResponse response = paymentService.preparePayment(email, request.planType());
        return ApiResponse.success(response);
    }

    /**
     * 빌링키 발급 및 첫 결제
     */
    @PostMapping("/billing-key")
    public ApiResponse<BillingKeyIssueResponse> issueBillingKey(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BillingKeyIssueRequest request
    ) {
        String email = userDetails.getUsername();
        BillingKeyIssueResponse response = paymentService.issueBillingKeyAndPay(email, request);
        return ApiResponse.success(response);
    }

    /**
     * 구독 취소
     */
    @DeleteMapping("/subscription")
    public ApiResponse<SubscriptionCancelResponse> cancelSubscription(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        SubscriptionCancelResponse response = paymentService.cancelSubscription(email);
        return ApiResponse.success(response);
    }

    /**
     * 결제 내역 조회
     */
    @GetMapping
    public ApiResponse<List<PaymentResponse>> getPaymentHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        List<PaymentResponse> payments = paymentService.getPaymentHistory(email);
        return ApiResponse.success(payments);
    }

    /**
     * 특정 결제 상세 조회
     */
    @GetMapping("/{paymentId}")
    public ApiResponse<PaymentResponse> getPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long paymentId
    ) {
        String email = userDetails.getUsername();
        PaymentResponse payment = paymentService.getPayment(email, paymentId);
        return ApiResponse.success(payment);
    }
}

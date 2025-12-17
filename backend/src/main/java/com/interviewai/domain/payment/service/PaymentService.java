package com.interviewai.domain.payment.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.interviewai.domain.payment.dto.BillingKeyIssueRequest;
import com.interviewai.domain.payment.dto.BillingKeyIssueResponse;
import com.interviewai.domain.payment.dto.PaymentPrepareResponse;
import com.interviewai.domain.payment.dto.PaymentResponse;
import com.interviewai.domain.payment.dto.SubscriptionCancelResponse;
import com.interviewai.domain.payment.dto.TossBillingKeyResponse;
import com.interviewai.domain.payment.dto.TossPaymentResponse;
import com.interviewai.domain.payment.entity.Payment;
import com.interviewai.domain.payment.entity.PlanType;
import com.interviewai.domain.payment.repository.PaymentRepository;
import com.interviewai.domain.user.entity.SubscriptionType;
import com.interviewai.domain.user.entity.User;
import com.interviewai.domain.user.repository.UserRepository;
import com.interviewai.global.exception.CustomException;
import com.interviewai.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final TossPaymentClient tossPaymentClient;

    /**
     * 결제 준비 (customerKey 생성)
     */
    public PaymentPrepareResponse preparePayment(String email, PlanType planType) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 이미 Premium 사용자인 경우 체크
        if (user.getSubscriptionType() == SubscriptionType.PREMIUM) {
            throw new CustomException(ErrorCode.ALREADY_PREMIUM);
        }

        // customerKey는 사용자 고유 식별자로 사용
        String customerKey = "CUSTOMER_" + user.getId();

        log.info("결제 준비 완료 - email: {}, customerKey: {}, amount: {}", email, customerKey, planType.getPrice());

        return new PaymentPrepareResponse(
                customerKey,  // orderId 대신 customerKey 사용
                planType.getPrice(),
                planType.getOrderName(),
                user.getEmail(),
                user.getNickname()
        );
    }

    /**
     * 빌링키 발급 및 첫 결제 처리
     */
    @Transactional
    public BillingKeyIssueResponse issueBillingKeyAndPay(String email, BillingKeyIssueRequest dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 이미 Premium 사용자인 경우 체크
        if (user.getSubscriptionType() == SubscriptionType.PREMIUM) {
            throw new CustomException(ErrorCode.ALREADY_PREMIUM);
        }

        String customerKey = "CUSTOMER_" + user.getId();
        PlanType planType = PlanType.PREMIUM_MONTHLY;

        try {
            // 1. 빌링키 발급
            TossBillingKeyResponse billingKeyResponse = tossPaymentClient.issueBillingKey(
                    dto.authKey(),
                    customerKey
            );

            String billingKey = billingKeyResponse.billingKey();
            String cardNumber = billingKeyResponse.card() != null ? billingKeyResponse.card().number() : null;

            // 2. 첫 결제 실행
            String orderId = "ORDER_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
            TossPaymentResponse paymentResponse = tossPaymentClient.billingPayment(
                    billingKey,
                    customerKey,
                    planType.getPrice(),
                    orderId,
                    planType.getOrderName()
            );

            // 3. Payment 엔티티 생성
            Payment payment = Payment.createCompleted(
                    user,
                    orderId,
                    paymentResponse.paymentKey(),
                    planType,
                    planType.getPrice(),
                    paymentResponse.method()
            );
            paymentRepository.save(payment);

            // 4. Premium 업그레이드
            LocalDateTime expiresAt = LocalDateTime.now().plusDays(planType.getDurationDays());
            user.upgradeToPremium(expiresAt, billingKey);

            log.info("빌링키 발급 및 결제 완료 - email: {}, expiresAt: {}", email, expiresAt);

            return new BillingKeyIssueResponse(
                    payment.getId(),
                    cardNumber,
                    expiresAt
            );

        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            log.error("빌링키 발급 실패 - email: {}, error: {}", email, e.getMessage());
            throw new CustomException(ErrorCode.PAYMENT_CONFIRM_FAILED);
        }
    }

    /**
     * 구독 취소 (만료일까지 유지 후 자동갱신 중단)
     */
    @Transactional
    public SubscriptionCancelResponse cancelSubscription(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (user.getSubscriptionType() != SubscriptionType.PREMIUM) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND);
        }

        if (user.isSubscriptionCancelled()) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_ALREADY_CANCELLED);
        }

        user.cancelSubscription();

        log.info("구독 취소 완료 - email: {}, expiresAt: {}", email, user.getSubscriptionExpiresAt());

        return new SubscriptionCancelResponse(
                "구독이 취소되었습니다. " + user.getSubscriptionExpiresAt().toLocalDate() + "까지 Premium 혜택을 이용할 수 있습니다.",
                user.getSubscriptionExpiresAt()
        );
    }

    /**
     * 정기결제 실행 (스케줄러에서 호출)
     */
    @Transactional
    public void processRecurringPayment(User user) {
        if (user.getBillingKey() == null) {
            log.warn("빌링키 없음 - userId: {}", user.getId());
            return;
        }

        String customerKey = "CUSTOMER_" + user.getId();
        PlanType planType = PlanType.PREMIUM_MONTHLY;
        String orderId = "ORDER_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);

        try {
            TossPaymentResponse paymentResponse = tossPaymentClient.billingPayment(
                    user.getBillingKey(),
                    customerKey,
                    planType.getPrice(),
                    orderId,
                    planType.getOrderName()
            );

            // Payment 엔티티 생성
            Payment payment = Payment.createCompleted(
                    user,
                    orderId,
                    paymentResponse.paymentKey(),
                    planType,
                    planType.getPrice(),
                    paymentResponse.method()
            );
            paymentRepository.save(payment);

            // 구독 연장
            user.renewSubscription(user.getSubscriptionExpiresAt().plusDays(planType.getDurationDays()));

            log.info("정기결제 성공 - userId: {}, newExpiresAt: {}", user.getId(), user.getSubscriptionExpiresAt());

        } catch (Exception e) {
            log.error("정기결제 실패 - userId: {}, error: {}", user.getId(), e.getMessage());

            // 실패 기록 저장
            Payment failedPayment = Payment.createFailed(user, orderId, planType, planType.getPrice());
            paymentRepository.save(failedPayment);

            // 결제 실패 시 FREE로 다운그레이드
            user.downgradeToFree();
        }
    }

    /**
     * 사용자의 결제 내역 조회
     */
    public List<PaymentResponse> getPaymentHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return paymentRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(PaymentResponse::from)
                .toList();
    }

    /**
     * 특정 결제 상세 조회
     */
    public PaymentResponse getPayment(String email, Long paymentId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.PAYMENT_USER_MISMATCH);
        }

        return PaymentResponse.from(payment);
    }
}

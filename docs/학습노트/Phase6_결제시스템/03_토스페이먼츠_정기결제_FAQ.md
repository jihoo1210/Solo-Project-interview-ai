# 토스페이먼츠 정기결제 FAQ

이 문서는 토스페이먼츠 정기결제(빌링) 시스템 구현 시 자주 묻는 질문과 답변을 정리합니다.

---

## Q1. 정기결제에서 간편결제(토스페이, 카카오페이, 네이버페이)를 사용할 수 있나요?

**A: 아니요, 토스페이먼츠 정기결제(빌링)는 신용·체크카드만 지원합니다.**

토스페이먼츠 공식 문서에 따르면:
- 자동결제(빌링)는 국내 카드만 지원
- 토스페이, 카카오페이, 네이버페이와 같은 국내 간편결제는 지원하지 않음
- PayPal(페이팔)과 같은 해외 간편결제도 지원하지 않음

### 왜 간편결제가 안 되나요?

간편결제 사업자(카카오페이, 네이버페이 등)는 자체적인 정기결제 시스템을 가지고 있습니다. 토스페이먼츠를 통해 이들의 정기결제를 연동하려면 별도의 계약과 연동이 필요합니다.

### 간편결제로 정기결제를 하려면?

각 간편결제 사업자와 직접 계약하고 별도로 연동해야 합니다:
- 카카오페이 정기결제
- 네이버페이 정기결제
- 토스페이 정기결제

---

## Q2. 빌링키란 무엇인가요?

**A: 빌링키는 카드 정보를 암호화한 토큰입니다.**

- 카드번호, 유효기간, CVC 등의 결제 정보를 암호화한 값
- 한 번 발급받으면 저장해두고 반복 결제에 사용
- 실제 카드 정보 대신 사용하여 보안성 향상

### 빌링키 발급 과정

```
1. 사용자가 결제창에서 카드 정보 입력
2. 토스페이먼츠가 카드 정보 검증
3. 검증 성공 시 authKey 발급 (successUrl로 전달)
4. 백엔드에서 authKey로 빌링키 발급 API 호출
5. 빌링키를 DB에 저장
6. 이후 빌링키로 자동 결제
```

---

## Q3. customerKey는 무엇이고 어떻게 생성하나요?

**A: customerKey는 고객을 식별하는 고유 키입니다.**

### 생성 규칙
- 최대 50자
- 영문, 숫자, -, _ 만 사용 가능
- 서비스 내에서 고유해야 함

### 권장 생성 방식

```java
// 방법 1: 사용자 ID 기반
String customerKey = "CUSTOMER_" + user.getId();

// 방법 2: UUID 기반 (일회성)
String customerKey = "CUSTOMER_" + UUID.randomUUID().toString().replace("-", "");
```

### 주의사항
- 동일한 customerKey로 여러 빌링키를 발급할 수 있음
- 빌링키 결제 시에도 동일한 customerKey 사용 필요

---

## Q4. 월간 구독과 연간 구독을 어떻게 구분하나요?

**A: PlanType enum으로 구분하고, 결제 금액과 만료일 계산을 다르게 처리합니다.**

### 백엔드 구현

```java
public enum PlanType {
    PREMIUM_MONTHLY("Premium 월간 구독", 9900, 30),
    PREMIUM_YEARLY("Premium 연간 구독", 99000, 365);

    private final String name;
    private final int price;
    private final int durationDays;

    // getters...
}
```

### 결제 처리

```java
@Transactional
public BillingKeyIssueResponse issueBillingKeyAndPay(String email, BillingKeyIssueRequest request) {
    PlanType planType = request.planType();

    // 금액과 기간을 PlanType에서 가져옴
    int amount = planType.getPrice();
    int durationDays = planType.getDurationDays();

    // 결제 실행
    TossPaymentResponse paymentResponse = tossPaymentClient.billingPayment(
        billingKey, customerKey, amount, orderId, planType.getName()
    );

    // 만료일 계산
    LocalDateTime expiresAt = LocalDateTime.now().plusDays(durationDays);
    user.upgradeToPremium(expiresAt, billingKey, planType);
}
```

### 프론트엔드 구현

```typescript
// types/index.ts
export type PlanType = 'PREMIUM_MONTHLY' | 'PREMIUM_YEARLY';

export const PLAN_TYPE_LABELS: Record<PlanType, {
  name: string;
  price: number;
  duration: string
}> = {
  PREMIUM_MONTHLY: { name: 'Premium 월간 구독', price: 9900, duration: '30일' },
  PREMIUM_YEARLY: { name: 'Premium 연간 구독', price: 99000, duration: '365일' },
};
```

---

## Q5. 자동 갱신(정기 결제)은 어떻게 처리하나요?

**A: Spring Scheduler를 사용하여 매일 만료 예정인 사용자를 조회하고 빌링키로 결제합니다.**

### 스케줄러 구현

```java
@Scheduled(cron = "0 0 9 * * *")  // 매일 오전 9시
public void processRecurringPayments() {
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime tomorrow = now.plusDays(1);

    // 만료 예정 + 취소 안함 + 빌링키 있는 사용자 조회
    List<User> users = userRepository.findUsersForRecurringPayment(now, tomorrow);

    for (User user : users) {
        try {
            // 저장된 PlanType으로 자동 결제
            PlanType planType = user.getPlanType();
            paymentService.processRecurringPayment(user, planType);
        } catch (Exception e) {
            // 결제 실패 시 다운그레이드
            user.downgradeToFree();
        }
    }
}
```

### Repository 쿼리

```java
@Query("SELECT u FROM User u WHERE u.subscriptionType = 'PREMIUM' " +
       "AND u.subscriptionCancelled = false " +
       "AND u.billingKey IS NOT NULL " +
       "AND u.subscriptionExpiresAt BETWEEN :now AND :tomorrow")
List<User> findUsersForRecurringPayment(LocalDateTime now, LocalDateTime tomorrow);
```

---

## Q6. 구독 취소는 즉시 해지인가요?

**A: 아니요, 취소 후에도 만료일까지 서비스를 이용할 수 있습니다.**

### 구독 취소 흐름

1. 사용자가 "구독 취소" 클릭
2. `subscriptionCancelled = true` 설정
3. 다음 결제 스케줄에서 이 사용자는 제외됨
4. 기존 만료일까지 Premium 서비스 이용 가능
5. 만료일 이후 스케줄러가 FREE로 다운그레이드

### 코드 예시

```java
// 구독 취소
public void cancelSubscription() {
    this.subscriptionCancelled = true;
    // subscriptionExpiresAt은 유지 → 만료일까지 이용 가능
}

// 만료 후 다운그레이드 (스케줄러에서 실행)
@Modifying
@Query("UPDATE User u SET u.subscriptionType = 'FREE', " +
       "u.subscriptionExpiresAt = null, u.billingKey = null " +
       "WHERE u.subscriptionCancelled = true " +
       "AND u.subscriptionExpiresAt < CURRENT_TIMESTAMP")
int downgradeExpiredCancelledUsers();
```

---

## Q7. 결제 실패 시 어떻게 처리하나요?

**A: 결제 실패 시 로그를 남기고, 사용자에게 알림을 보내거나 다운그레이드 처리합니다.**

### 에러 처리 전략

```java
try {
    TossPaymentResponse response = tossPaymentClient.billingPayment(...);
} catch (WebClientResponseException e) {
    // 토스페이먼츠 에러 응답 파싱
    TossErrorResponse error = objectMapper.readValue(
        e.getResponseBodyAsString(),
        TossErrorResponse.class
    );

    switch (error.code()) {
        case "CARD_LIMIT_EXCEEDED":
            // 한도 초과 - 카드 변경 요청
            break;
        case "CARD_EXPIRED":
            // 카드 만료 - 새 카드 등록 요청
            break;
        default:
            // 기타 에러 - 재시도 또는 다운그레이드
            break;
    }
}
```

### 재시도 정책

- 결제 실패 시 즉시 다운그레이드하지 않고 1-2일 재시도
- 재시도 실패 시 이메일로 카드 변경 요청
- 3일 후에도 실패 시 다운그레이드

---

## Q8. 테스트 모드에서는 어떻게 테스트하나요?

**A: 토스페이먼츠 테스트 카드 정보를 사용합니다.**

### 테스트 카드 정보

| 항목 | 값 |
|------|-----|
| 카드번호 | 4330000012341234 |
| 유효기간 | 12/24 (미래 날짜) |
| CVC | 123 |
| 비밀번호 앞 2자리 | 12 |

### 테스트 환경 설정

```yaml
# application.yml
toss:
  payments:
    client-key: test_ck_xxx  # test_ 접두사
    secret-key: test_sk_xxx  # test_ 접두사
```

### 주의사항

- 테스트 모드에서는 실제 결제가 이루어지지 않음
- 실서비스 전환 시 라이브 키로 변경 필요
- 라이브 모드에서는 토스페이먼츠와 별도 계약 필요

---

## Q9. SDK v1과 v2의 차이점은 무엇인가요?

**A: v2가 최신 버전이며, 빌링키 발급 방식이 다릅니다.**

### SDK v1 (레거시)

```javascript
// index.html
<script src="https://js.tosspayments.com/v1/payment"></script>

// 사용
tossPayments.requestBillingAuth('카드', options);
```

### SDK v2 (권장)

```javascript
// index.html
<script src="https://js.tosspayments.com/v2/standard"></script>

// 사용
const payment = tossPayments.payment({ customerKey });
payment.requestBillingKeyAuth('카드', options);
```

### 주요 차이점

| 항목 | v1 | v2 |
|------|-----|-----|
| 빌링키 발급 | requestBillingAuth | requestBillingKeyAuth |
| customerKey | 콜백 파라미터로 전달 | payment 초기화 시 전달 |
| 지원 상태 | 유지보수만 | 활발한 업데이트 |

---

## Q10. 프론트엔드에서 플랜 정보를 어떻게 전달하나요?

**A: localStorage를 사용하여 결제 페이지와 성공 페이지 간에 플랜 정보를 공유합니다.**

### 결제 요청 시 저장

```typescript
// PaymentPage.tsx
const handlePayment = async () => {
  // 선택한 플랜 저장
  localStorage.setItem('selectedPlanType', selectedPlan);

  // 토스 결제창 호출
  await payment.requestBillingKeyAuth('카드', {
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
  });
};
```

### 결제 성공 시 사용

```typescript
// PaymentSuccessPage.tsx
useEffect(() => {
  // localStorage에서 플랜 정보 가져오기
  const savedPlanType = localStorage.getItem('selectedPlanType') as PlanType || 'PREMIUM_MONTHLY';

  // 백엔드에 전달
  const response = await issueBillingKey({
    authKey: authKey!,
    planType: savedPlanType
  });

  // 사용 후 정리
  localStorage.removeItem('selectedPlanType');
}, [authKey]);
```

---

## 참고 자료

- [토스페이먼츠 개발자센터 - 자동결제(빌링) 가이드](https://docs.tosspayments.com/guides/v2/billing)
- [토스페이먼츠 API 레퍼런스](https://docs.tosspayments.com/reference)
- [토스페이먼츠 FAQ - 자동결제](https://docs.tosspayments.com/resources/glossary/billing)

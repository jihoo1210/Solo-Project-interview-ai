# [Phase 6] 결제 시스템 구현서 v1.0

> 작성일: 2025-12-17
> 버전: 1.0
> 작성자: AI Interview Simulator Team

---

## 1. 개요

Phase 6에서는 토스페이먼츠를 활용한 결제 시스템을 구현합니다. FREE 사용자가 Premium으로 업그레이드할 수 있도록 결제 플로우를 제공하고, 결제 내역 관리 및 구독 만료 처리를 구현합니다.

---

## 2. 기술 스택

### 2.1 결제 게이트웨이
- **토스페이먼츠** (TossPayments)
- 테스트 모드로 구현 (실 결제 X)
- 카드 결제 지원

### 2.2 Backend
- Spring Boot 3.4.x
- RestClient (토스페이먼츠 API 호출)
- Spring Scheduling (구독 만료 처리)

### 2.3 Frontend
- React 18 + TypeScript
- 토스페이먼츠 JavaScript SDK

---

## 3. 구독 플랜

### 3.1 FREE (무료)
- 일일 면접 3회 제한
- 질문 5개 고정
- 꼬리질문 비활성화

### 3.2 PREMIUM (월 9,900원)
- 무제한 면접
- 질문 개수 선택 (3, 5, 7, 10개)
- 꼬리질문 활성화
- 노란색 토끼

---

## 4. 결제 플로우

```
[사용자] → [결제 페이지] → [토스페이먼츠 결제창]
                                    ↓
[결제 성공] ← [토스페이먼츠 승인] ← [결제 완료]
     ↓
[Premium 업그레이드] → [구독 만료일 설정 (30일)]
```

### 4.1 결제 프로세스
1. 사용자가 "Upgrade Premium" 버튼 클릭
2. 결제 페이지로 이동
3. 토스페이먼츠 결제창 호출
4. 결제 완료 후 successUrl로 리다이렉트
5. Backend에서 결제 승인 API 호출
6. 승인 성공 시 Premium 업그레이드
7. 결제 완료 페이지 표시

---

## 5. Task 목록

### Backend

- [x] Task 1: Payment 엔티티 및 Repository 생성
- [x] Task 2: 토스페이먼츠 설정 및 RestClient 구성
- [x] Task 3: PaymentService 구현 (결제 승인, 취소)
- [x] Task 4: PaymentController 구현
- [x] Task 5: Premium 업그레이드/만료 로직

### Frontend

- [x] Task 6: 결제 페이지 UI (PaymentPage)
- [x] Task 7: 결제 완료/실패 페이지
- [x] Task 8: MyPage 결제 내역 탭

### 공통

- [x] Task 9: 빌드 테스트 및 문서 완성

---

## 6. 데이터베이스 설계

### 6.1 Payment 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | BIGINT | PK |
| user_id | BIGINT | FK (User) |
| order_id | VARCHAR(100) | 주문 ID (UUID) |
| payment_key | VARCHAR(200) | 토스페이먼츠 결제키 |
| amount | INTEGER | 결제 금액 |
| status | VARCHAR(20) | PENDING, COMPLETED, CANCELLED, FAILED |
| method | VARCHAR(20) | CARD, VIRTUAL_ACCOUNT 등 |
| approved_at | TIMESTAMP | 승인 시간 |
| created_at | TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | 수정 시간 |

### 6.2 User 테이블 (기존 필드 활용)

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| subscription_type | VARCHAR | FREE / PREMIUM |
| subscription_expires_at | TIMESTAMP | Premium 만료일 |

---

## 7. API 설계

### 7.1 결제 요청 생성

```
POST /api/payments/request

Request:
{
  "planType": "PREMIUM_MONTHLY"
}

Response:
{
  "success": true,
  "data": {
    "orderId": "uuid-order-id",
    "amount": 9900,
    "orderName": "AI 면접 시뮬레이터 Premium (1개월)"
  }
}
```

### 7.2 결제 승인

```
POST /api/payments/confirm

Request:
{
  "paymentKey": "toss-payment-key",
  "orderId": "uuid-order-id",
  "amount": 9900
}

Response:
{
  "success": true,
  "data": {
    "paymentId": 1,
    "status": "COMPLETED",
    "subscriptionExpiresAt": "2025-01-17T00:00:00"
  }
}
```

### 7.3 결제 내역 조회

```
GET /api/payments

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderId": "uuid-order-id",
      "amount": 9900,
      "status": "COMPLETED",
      "method": "CARD",
      "approvedAt": "2024-12-17T10:00:00",
      "createdAt": "2024-12-17T10:00:00"
    }
  ]
}
```

---

## 8. 토스페이먼츠 연동

### 8.1 환경 변수

```properties
# application.yml
toss:
  payments:
    client-key: test_ck_xxx  # 클라이언트 키
    secret-key: test_sk_xxx  # 시크릿 키
    api-url: https://api.tosspayments.com/v1
```

### 8.2 결제 승인 API 호출

```java
@Service
public class TossPaymentClient {

    private final RestClient restClient;

    public PaymentConfirmResponse confirmPayment(String paymentKey, String orderId, int amount) {
        return restClient.post()
            .uri("/payments/confirm")
            .header("Authorization", "Basic " + encodeSecretKey())
            .body(new PaymentConfirmRequest(paymentKey, orderId, amount))
            .retrieve()
            .body(PaymentConfirmResponse.class);
    }
}
```

---

## 9. Frontend 구현

### 9.1 토스페이먼츠 SDK 로드

```html
<!-- index.html -->
<script src="https://js.tosspayments.com/v1/payment"></script>
```

### 9.2 결제 요청

```typescript
// PaymentPage.tsx
const tossPayments = window.TossPayments(clientKey);

const handlePayment = async () => {
  const { orderId, amount, orderName } = await createPaymentRequest();

  await tossPayments.requestPayment('카드', {
    amount,
    orderId,
    orderName,
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
  });
};
```

### 9.3 결제 성공 처리

```typescript
// PaymentSuccessPage.tsx
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const paymentKey = params.get('paymentKey');
  const orderId = params.get('orderId');
  const amount = params.get('amount');

  confirmPayment({ paymentKey, orderId, amount });
}, []);
```

---

## 10. 파일 구조

### Backend
```
backend/src/main/java/com/interviewai/
├── domain/
│   └── payment/
│       ├── controller/
│       │   └── PaymentController.java
│       ├── dto/
│       │   ├── PaymentRequestDto.java
│       │   ├── PaymentConfirmDto.java
│       │   └── PaymentResponse.java
│       ├── entity/
│       │   ├── Payment.java
│       │   └── PaymentStatus.java
│       ├── repository/
│       │   └── PaymentRepository.java
│       └── service/
│           ├── PaymentService.java
│           └── TossPaymentClient.java
└── global/
    └── config/
        └── TossPaymentConfig.java
```

### Frontend
```
frontend/src/
├── pages/
│   └── payment/
│       ├── PaymentPage.tsx
│       ├── PaymentSuccessPage.tsx
│       └── PaymentFailPage.tsx
├── api/
│   └── payment.ts
└── types/
    └── payment.ts
```

---

## 11. 구현 체크리스트

### Backend
- [x] Payment 엔티티 생성
- [x] PaymentStatus enum 생성
- [x] PlanType enum 생성
- [x] PaymentRepository 생성
- [x] TossPaymentProperties 설정
- [x] TossPaymentConfig 설정
- [x] TossPaymentClient 구현
- [x] PaymentService 구현
- [x] PaymentController 구현
- [x] User.upgradeToPremium() 메서드 추가
- [x] 구독 만료 스케줄러 구현 (DailyResetScheduler)
- [x] 빌드 테스트

### Frontend
- [x] payment API 함수 작성
- [x] toss.d.ts 타입 선언 추가
- [x] PaymentPage 구현
- [x] PaymentSuccessPage 구현
- [x] PaymentFailPage 구현
- [x] MyPage 결제 내역 탭 추가
- [x] 라우터 설정
- [x] 빌드 테스트

---

## 12. 보안 고려사항

1. **Secret Key 보호**: 서버에서만 사용, 환경변수로 관리
2. **금액 검증**: 서버에서 결제 금액 재검증
3. **중복 결제 방지**: orderId 유니크 검증
4. **HTTPS 필수**: 결제 데이터 암호화 전송

---

## 13. 테스트 시나리오

### 13.1 정상 결제
1. FREE 사용자로 로그인
2. MyPage → Upgrade Premium 클릭
3. 결제 페이지에서 결제 진행
4. 테스트 카드 정보 입력
5. 결제 완료 확인
6. Premium으로 업그레이드 확인

### 13.2 결제 실패
1. 결제 중 취소 버튼 클릭
2. 실패 페이지로 이동 확인
3. 구독 상태 변경 없음 확인

### 13.3 토스페이먼츠 테스트 카드
- 카드번호: 4330000012341234
- 유효기간: 12/24
- CVC: 123
- 비밀번호: 12

---

> **Phase 6 구현 완료!**
> 2025-12-17

# ErrorCode 구조화 이유

## 질문
> 에러 코드를 이렇게 구체화하는 이유는 뭔가요?

---

## 현재 프로젝트의 에러 코드 체계

```
1xxx - 공통 에러 (Common)
2xxx - 인증 에러 (Auth)
3xxx - 면접 에러 (Interview)
4xxx - 결제 에러 (Payment)
5xxx - AI 에러 (AI)
```

### 실제 코드 예시 (ErrorCode.java)
```java
public enum ErrorCode {
    // 1xxx: 공통 에러
    INVALID_INPUT(1001, "잘못된 입력입니다"),
    RESOURCE_NOT_FOUND(1002, "리소스를 찾을 수 없습니다"),
    INTERNAL_ERROR(1003, "서버 내부 오류입니다"),

    // 2xxx: 인증 에러
    INVALID_TOKEN(2001, "유효하지 않은 토큰입니다"),
    EXPIRED_TOKEN(2002, "만료된 토큰입니다"),
    UNAUTHORIZED(2003, "인증이 필요합니다"),

    // 3xxx: 면접 에러
    INTERVIEW_NOT_FOUND(3001, "면접을 찾을 수 없습니다"),
    INTERVIEW_ALREADY_COMPLETED(3002, "이미 완료된 면접입니다"),

    // ... 등등
}
```

---

## 왜 이렇게 구조화하나요?

### 1. 프론트엔드에서 에러 처리가 쉬워집니다

```typescript
// 프론트엔드 에러 핸들링 예시
const handleError = (errorCode: number) => {
  const domain = Math.floor(errorCode / 1000);

  switch (domain) {
    case 1: // 공통 에러
      showToast("일반 오류가 발생했습니다");
      break;
    case 2: // 인증 에러
      logout(); // 로그아웃 처리
      redirect("/login");
      break;
    case 3: // 면접 에러
      redirect("/interviews");
      break;
    case 4: // 결제 에러
      showPaymentErrorModal();
      break;
  }
};
```

**장점**: 코드 범위만 보고 어떤 종류의 에러인지 바로 알 수 있음

---

### 2. 디버깅이 빨라집니다

에러 로그에서 코드만 봐도 문제 영역을 즉시 파악:

```
[ERROR] 2024-01-15 10:30:15 - ErrorCode: 2001
→ "아, 인증 관련 문제구나" (2xxx = 인증)

[ERROR] 2024-01-15 10:30:20 - ErrorCode: 3002
→ "면접 기능에서 문제가 생겼네" (3xxx = 면접)
```

**비교 - 구조화 안 된 경우**:
```
[ERROR] ErrorCode: 47
→ "이게 뭐지...? 코드표 찾아봐야겠다..."
```

---

### 3. 로깅 및 모니터링 분석이 용이합니다

```sql
-- 도메인별 에러 발생 현황 분석
SELECT
  CASE
    WHEN error_code BETWEEN 1000 AND 1999 THEN '공통'
    WHEN error_code BETWEEN 2000 AND 2999 THEN '인증'
    WHEN error_code BETWEEN 3000 AND 3999 THEN '면접'
    WHEN error_code BETWEEN 4000 AND 4999 THEN '결제'
    WHEN error_code BETWEEN 5000 AND 5999 THEN 'AI'
  END as domain,
  COUNT(*) as error_count
FROM error_logs
GROUP BY domain;
```

**결과 예시**:
| domain | error_count |
|--------|-------------|
| 공통   | 150         |
| 인증   | 89          |
| 면접   | 234         |
| 결제   | 12          |
| AI     | 45          |

→ "면접 도메인에서 에러가 많이 발생하네, 집중적으로 개선해야겠다"

---

### 4. API 문서화가 명확해집니다

Swagger/OpenAPI 문서에서:

```yaml
responses:
  400:
    description: Bad Request
    content:
      application/json:
        examples:
          인증_토큰_만료:
            value:
              code: 2002
              message: "만료된 토큰입니다"
          면접_없음:
            value:
              code: 3001
              message: "면접을 찾을 수 없습니다"
```

프론트엔드 개발자: "2xxx면 인증 문제니까 다시 로그인 유도하면 되겠네"

---

### 5. 팀 협업과 역할 분담이 명확해집니다

```
담당자 A (인증팀): 2xxx 에러 담당
담당자 B (면접팀): 3xxx 에러 담당
담당자 C (결제팀): 4xxx 에러 담당
```

에러 발생 시 → 코드만 보고 담당자 바로 파악 가능

---

### 6. 확장성이 좋습니다

나중에 새 도메인 추가할 때:

```java
// 6xxx: 알림 에러 (새로 추가)
NOTIFICATION_FAILED(6001, "알림 발송에 실패했습니다"),
INVALID_DEVICE_TOKEN(6002, "유효하지 않은 디바이스 토큰입니다"),

// 7xxx: 커뮤니티 에러 (새로 추가)
POST_NOT_FOUND(7001, "게시글을 찾을 수 없습니다"),
```

기존 코드와 충돌 없이 깔끔하게 확장 가능

---

## 업계 표준 사례

### HTTP 상태 코드
```
1xx - 정보
2xx - 성공
3xx - 리다이렉션
4xx - 클라이언트 에러
5xx - 서버 에러
```

### AWS 에러 코드
```
AccessDenied, InvalidParameterValue, ResourceNotFound...
→ 접두사로 도메인 구분
```

### Stripe (결제)
```
card_declined, expired_card, invalid_cvc...
→ 카테고리별 접두사 사용
```

우리 프로젝트도 이런 업계 표준 패턴을 따르는 것입니다.

---

## 정리

| 장점 | 설명 |
|------|------|
| 가독성 | 코드만 봐도 에러 종류 파악 |
| 디버깅 | 문제 영역 즉시 식별 |
| 분석 | 도메인별 통계 쉽게 추출 |
| 문서화 | API 문서에서 명확한 분류 |
| 협업 | 담당자 역할 분담 용이 |
| 확장성 | 새 도메인 추가 시 충돌 없음 |

**핵심**: 에러 코드 체계는 "코드의 가독성"이 아닌 "시스템 운영의 효율성"을 위한 것

---

## 관련 파일
- `backend/src/main/java/com/interviewai/global/exception/ErrorCode.java`
- `backend/src/main/java/com/interviewai/global/exception/CustomException.java`
- `backend/src/main/java/com/interviewai/global/exception/GlobalExceptionHandler.java`

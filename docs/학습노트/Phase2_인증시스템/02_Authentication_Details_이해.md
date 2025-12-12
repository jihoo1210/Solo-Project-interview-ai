# Authentication Details 이해

## 질문
> `authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));`
> 이것은 무엇이고 왜 저장하나요?

---

## 1. Details란?

### Authentication 객체 구조

```java
UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
    userDetails,              // Principal: 인증된 사용자 정보
    null,                     // Credentials: 비밀번호 (인증 후 null)
    userDetails.getAuthorities()  // Authorities: 권한 목록
);

authentication.setDetails(details);  // Details: 추가 정보
```

| 필드 | 설명 | 예시 |
|------|------|------|
| **Principal** | 인증된 사용자 | `UserPrincipal` 객체 |
| **Credentials** | 인증 수단 | 비밀번호 (보통 인증 후 null) |
| **Authorities** | 권한 목록 | `ROLE_FREE`, `ROLE_PREMIUM` |
| **Details** | 요청 부가 정보 | IP 주소, 세션 ID 등 |

---

## 2. WebAuthenticationDetails가 담는 정보

```java
new WebAuthenticationDetailsSource().buildDetails(request)
```

이 코드가 생성하는 `WebAuthenticationDetails` 객체:

```java
public class WebAuthenticationDetails {
    private final String remoteAddress;  // 클라이언트 IP 주소
    private final String sessionId;       // 세션 ID (있으면)
}
```

### 실제 값 예시

```
remoteAddress: "192.168.0.100"
sessionId: "ABC123DEF456"
```

---

## 3. 왜 저장하나요?

### 용도 1: 보안 감사 (Audit)

```java
// 컨트롤러에서 로그 남기기
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
WebAuthenticationDetails details = (WebAuthenticationDetails) auth.getDetails();

log.info("사용자 {} 가 IP {} 에서 접근",
    auth.getName(),
    details.getRemoteAddress());

// 출력: "사용자 test@email.com 가 IP 192.168.0.100 에서 접근"
```

### 용도 2: 동일 IP 제한

```java
// 동일 IP에서 너무 많은 요청 차단
String clientIp = details.getRemoteAddress();
if (rateLimiter.isBlocked(clientIp)) {
    throw new TooManyRequestsException();
}
```

### 용도 3: 의심스러운 활동 감지

```java
// 평소와 다른 IP에서 로그인 시 알림
if (!user.getLastLoginIp().equals(details.getRemoteAddress())) {
    sendSecurityAlert(user, "새로운 위치에서 로그인 감지");
}
```

### 용도 4: 세션 관리

```java
// 세션 ID로 중복 로그인 관리
String sessionId = details.getSessionId();
sessionRegistry.registerSession(userId, sessionId);
```

---

## 4. 없어도 동작은 하나요?

**네, 없어도 인증 자체는 동작합니다.**

```java
// 이 줄을 생략해도 인증은 됨
// authentication.setDetails(...);

// 하지만 나중에 details가 필요할 때 null이 됨
WebAuthenticationDetails details = (WebAuthenticationDetails) auth.getDetails();
// details = null → NullPointerException 위험!
```

### 권장 사항

- **개인 프로젝트**: 생략 가능 (단, 보안 로그 필요 시 추가)
- **실무 프로젝트**: 항상 설정 (보안 감사, 로깅에 필수)

---

## 5. 커스텀 Details 만들기

기본 `WebAuthenticationDetails` 외에 추가 정보가 필요하면:

```java
// 커스텀 Details 클래스
public class CustomAuthDetails extends WebAuthenticationDetails {
    private final String userAgent;
    private final String deviceType;

    public CustomAuthDetails(HttpServletRequest request) {
        super(request);
        this.userAgent = request.getHeader("User-Agent");
        this.deviceType = detectDevice(userAgent);
    }
}

// 사용
authentication.setDetails(new CustomAuthDetails(request));
```

---

## 6. 요약

| 항목 | 설명 |
|------|------|
| **Details** | 인증 요청의 부가 정보 (IP, 세션 등) |
| **WebAuthenticationDetails** | Spring Security 기본 제공 Details 클래스 |
| **remoteAddress** | 클라이언트 IP 주소 |
| **sessionId** | HTTP 세션 ID |
| **용도** | 보안 감사, IP 제한, 로깅, 세션 관리 |

---

## 관련 파일
- `global/security/jwt/JwtAuthenticationFilter.java`

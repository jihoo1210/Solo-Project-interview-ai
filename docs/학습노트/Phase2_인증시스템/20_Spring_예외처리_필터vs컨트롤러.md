# Spring 예외처리: Filter vs Controller

> Filter에서 발생한 예외는 @RestControllerAdvice가 처리하지 못합니다.

---

## 1. 요청 처리 흐름

```
HTTP 요청
    ↓
[Filter Chain] ← JwtAuthenticationFilter 등
    ↓
[DispatcherServlet]
    ↓
[Controller] ← 여기서 발생한 예외만
    ↓              @ExceptionHandler가 처리
[Service]
    ↓
[Repository]
```

---

## 2. @RestControllerAdvice의 범위

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<?> handleCustomException(CustomException e) {
        // Controller, Service, Repository에서 발생한 예외만 처리
        // Filter에서 발생한 예외는 여기까지 도달 못함!
    }
}
```

**처리 가능:**
- Controller에서 발생한 예외
- Service에서 발생한 예외
- Repository에서 발생한 예외

**처리 불가:**
- Filter에서 발생한 예외 (DispatcherServlet 이전 단계)

---

## 3. Filter에서의 예외 처리

### 잘못된 방법 (스택트레이스 출력됨)
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(...) {
        String token = jwtTokenProvider.resolveToken(request);
        // 예외 발생 시 Spring이 기본 로깅 → 스택트레이스 출력
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        // ...
    }
}
```

### 올바른 방법 (직접 try-catch)
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(...) {
        try {
            String token = jwtTokenProvider.resolveToken(request);
            if (!StringUtils.isBlank(token) && jwtTokenProvider.validateToken(token)) {
                String email = jwtTokenProvider.getUserEmail(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                // 인증 처리...
            }
        } catch (Exception e) {
            // 조용히 처리 (인증 실패 시 그냥 통과 → Security가 처리)
            log.debug("JWT 인증 실패: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);  // 반드시 호출
    }
}
```

---

## 4. 왜 Filter 예외를 조용히 처리하나?

JWT 인증 실패 시나리오:
1. 토큰 없음 → 인증 없이 진행 → Security가 권한 체크
2. 토큰 만료 → 인증 없이 진행 → 401 응답
3. 토큰 변조 → 인증 없이 진행 → 401 응답

**핵심**: Filter에서 예외를 던지지 않고, 인증 정보만 설정하지 않으면 Spring Security가 알아서 401/403 처리합니다.

---

## 5. Filter에서 직접 응답해야 하는 경우

특별한 에러 응답이 필요할 때:

```java
@Override
protected void doFilterInternal(...) {
    try {
        // 인증 로직
    } catch (ExpiredJwtException e) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\": \"토큰이 만료되었습니다\"}");
        return;  // filterChain.doFilter 호출하지 않음
    }

    filterChain.doFilter(request, response);
}
```

---

## 6. 정리

| 발생 위치 | 처리 방법 |
|----------|----------|
| Controller/Service | `@ExceptionHandler` |
| Filter | 직접 try-catch |

**Filter 예외 처리 원칙:**
1. try-catch로 감싸기
2. 로그는 `debug` 레벨로 (필요시)
3. 인증 실패는 그냥 통과 → Security가 처리
4. 특별한 응답 필요 시 직접 response에 작성

---

## 관련 키워드
- Spring Filter
- OncePerRequestFilter
- @RestControllerAdvice
- @ExceptionHandler
- Spring Security
- JWT 인증 필터

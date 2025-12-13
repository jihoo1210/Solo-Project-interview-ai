# 정적 팩토리 메서드: from vs of

> 작성일: 2024-12-13
> Phase: 2 (인증 시스템)

---

## 1. 정적 팩토리 메서드란?

`new` 키워드 대신 **정적 메서드로 객체를 생성**하는 패턴입니다.

```java
// new 사용
User user = new User(email, nickname);

// 정적 팩토리 메서드 사용
UserResponse response = UserResponse.from(user);
```

---

## 2. of vs from 차이

| 메서드 | 용도 | 파라미터 |
|--------|------|----------|
| `of` | 여러 개의 **원시 값/단순 값**으로 생성 | 여러 개의 단순 파라미터 |
| `from` | **하나의 객체**를 변환하여 생성 | 단일 객체 |

---

## 3. 예시

### of - 여러 값을 조합

```java
// 여러 단순 값으로 객체 생성
public static LoginResponse of(String accessToken, String email, String nickname) {
    return LoginResponse.builder()
        .accessToken(accessToken)
        .email(email)
        .nickname(nickname)
        .build();
}

// 사용
LoginResponse.of(token, "test@email.com", "홍길동");
```

### from - 객체 변환

```java
// 하나의 객체에서 필요한 정보 추출
public static UserResponse from(User user) {
    return UserResponse.builder()
        .id(user.getId())
        .email(user.getEmail())
        .nickname(user.getNickname())
        .build();
}

// 사용
UserResponse.from(user);
```

---

## 4. 실제 적용 (현재 프로젝트)

### SignupResponse.java
```java
// User 객체 하나를 변환 → from 사용
public static SignupResponse from(User user) { ... }
```

### LoginResponse.java
```java
// accessToken(String) + User(객체) → of 사용
public static LoginResponse of(String accessToken, User user) { ... }
```

---

## 5. 네이밍 컨벤션 (Effective Java)

| 메서드명 | 설명 | 예시 |
|----------|------|------|
| `of` | 여러 파라미터를 받아 인스턴스 반환 | `EnumSet.of(E1, E2)` |
| `from` | 하나의 파라미터로 타입 변환 | `Date.from(instant)` |
| `valueOf` | of의 자세한 버전 | `BigInteger.valueOf(10)` |
| `getInstance` | 인스턴스 반환 (싱글톤 등) | `Calendar.getInstance()` |
| `create/newInstance` | 매번 새 인스턴스 반환 보장 | `Array.newInstance()` |

---

## 6. 왜 사용하나?

1. **이름을 가질 수 있다** - 생성 의도 명확
2. **호출할 때마다 새 객체 생성 안 해도 됨** - 캐싱 가능
3. **반환 타입의 하위 타입 반환 가능** - 유연성
4. **가독성 향상** - `from(user)` vs `new Response(user.getId(), user.getEmail()...)`

---

## 7. 정리

```
of   → "이 값들로(of) 만들어줘"
from → "이 객체에서(from) 변환해줘"
```

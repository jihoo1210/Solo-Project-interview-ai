# Java 제네릭 타입 추론

> 작성일: 2024-12-13
> Phase: 2 (인증 시스템)

---

## 1. 질문 배경

```java
@GetMapping("/verify-email")
public ApiResponse<?> verifyEmail(@RequestParam String token) {
    authService.verifyEmail(token);
    return ApiResponse.success();  // 제네릭 타입 지정 안 함
}
```

`ApiResponse.success()`에서 제네릭 타입을 지정하지 않았는데 오류가 나지 않는 이유는?

---

## 2. 와일드카드 `<?>`

```java
public ApiResponse<?> verifyEmail(...)
```

`<?>`는 **어떤 타입이든 허용**한다는 의미입니다.

| 표현 | 의미 |
|------|------|
| `<?>` | 모든 타입 허용 |
| `<T>` | 특정 타입 T |
| `<? extends Number>` | Number 또는 하위 타입 |
| `<? super Integer>` | Integer 또는 상위 타입 |

---

## 3. 정적 메서드의 제네릭 타입 추론

### ApiResponse.success() 구현

```java
public static <T> ApiResponse<T> success() {
    return ApiResponse.<T>builder()
            .success(true)
            .timestamp(LocalDateTime.now())
            .build();
}
```

- `<T>`는 **호출 시점에 타입 추론**됨
- 명시하지 않으면 컴파일러가 문맥에서 추론

### 타입 추론 흐름

| 코드 | 추론된 타입 |
|------|------------|
| `ApiResponse.success()` | `ApiResponse<Object>` |
| `ApiResponse<?>` | 모든 `ApiResponse<T>` 허용 |
| 결과 | 호환됨 ✅ |

---

## 4. 명시적 vs 암시적

### 암시적 (타입 추론)
```java
return ApiResponse.success();
```

### 명시적 (타입 지정)
```java
return ApiResponse.<Void>success();
```

`<?>`로 받으면 생략해도 되지만, `<Void>`를 명시하면 더 명확합니다.

---

## 5. `Void` vs `?`

| 반환 타입 | 의미 | 사용 상황 |
|----------|------|----------|
| `ApiResponse<Void>` | 데이터 없음을 명시 | 반환 데이터가 없는 API |
| `ApiResponse<?>` | 어떤 타입이든 가능 | 타입을 특정할 수 없을 때 |

### 권장
- 데이터 없는 응답: `ApiResponse<Void>`
- 데이터 있는 응답: `ApiResponse<UserResponse>` 등 구체적 타입

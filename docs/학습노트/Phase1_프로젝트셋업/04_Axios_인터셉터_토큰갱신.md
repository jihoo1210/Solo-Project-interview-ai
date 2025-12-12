# Axios 인터셉터와 토큰 갱신 로직 이해

## 질문
> `as` 문법과 `_retry` 같은 것을 전체적으로 잘 모르겠어요

---

## 전체 코드 흐름도

```
[API 요청] → [Request 인터셉터] → [서버] → [Response 인터셉터] → [결과]
                    ↓                              ↓
              토큰 자동 첨부              401 에러 시 토큰 갱신 시도
```

---

## 1. `as` 문법 (TypeScript 타입 단언)

### 기본 개념
```typescript
const value = something as SomeType;
```

**"나는 이 값이 이 타입이라고 확신해!"** 라고 TypeScript에게 알려주는 것

### 코드에서의 사용
```typescript
const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
```

#### 분해해서 보기:

```typescript
// error.config의 원래 타입
error.config  // 타입: AxiosRequestConfig | undefined

// 우리가 원하는 타입
InternalAxiosRequestConfig & { _retry?: boolean }
```

#### `&`는 **교차 타입 (Intersection Type)**
```typescript
// 두 타입을 합침
InternalAxiosRequestConfig & { _retry?: boolean }

// 의미: InternalAxiosRequestConfig의 모든 속성 +  _retry 속성 추가
```

#### 왜 필요한가?
```typescript
// as 없이 사용하면?
originalRequest._retry = true;  // ❌ 에러! '_retry' 속성이 타입에 없음

// as로 타입 단언 후
const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
originalRequest._retry = true;  // ✅ OK!
```

---

## 2. `_retry` 패턴 (무한 루프 방지)

### 문제 상황
```
1. API 요청 → 401 에러 (토큰 만료)
2. 토큰 갱신 시도
3. 갱신된 토큰으로 원래 요청 재시도
4. 또 401 에러 (갱신 토큰도 만료됐다면?)
5. 또 토큰 갱신 시도...
6. 무한 반복! 💥
```

### 해결책: `_retry` 플래그
```typescript
// 첫 번째 401 에러
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;  // "이미 한 번 시도했음" 표시
  // 토큰 갱신 후 재요청...
}

// 두 번째 401 에러 (재시도한 요청도 실패)
if (error.response?.status === 401 && !originalRequest._retry) {
  // _retry가 true이므로 이 블록 실행 안 됨!
  // → 무한 루프 방지
}
```

### 흐름도
```
[요청 A] → 401 에러
     ↓
_retry 확인: false (첫 시도)
     ↓
_retry = true 설정
     ↓
토큰 갱신
     ↓
[요청 A 재시도] → 또 401 에러
     ↓
_retry 확인: true (이미 시도함)
     ↓
재시도 안 함 → 에러 반환 → 로그인 페이지로
```

---

## 3. 전체 코드 상세 설명

```typescript
apiClient.interceptors.response.use(
  // ✅ 성공 응답: 그대로 반환
  (response) => response,

  // ❌ 에러 응답: 처리 로직
  async (error: AxiosError<ApiResponse<never>>) => {
```

### 3.1 타입 단언
```typescript
const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
```
- `error.config`: 원래 요청 설정 객체
- `as ...`: 커스텀 `_retry` 속성을 추가할 수 있도록 타입 확장

### 3.2 토큰 갱신 조건 체크
```typescript
if (error.response?.status === 401 && !originalRequest._retry) {
```
- `error.response?.status === 401`: 인증 실패 에러인가?
- `!originalRequest._retry`: 아직 재시도 안 했는가?

### 3.3 재시도 플래그 설정
```typescript
originalRequest._retry = true;
```
- 이 요청은 "이미 한 번 갱신을 시도했음"으로 표시

### 3.4 토큰 갱신 요청
```typescript
const refreshToken = localStorage.getItem('refreshToken');
if (refreshToken) {
  const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
    refreshToken,
  });
```
- 저장된 Refresh Token으로 새 Access Token 요청
- **주의**: `apiClient`가 아닌 일반 `axios` 사용 (인터셉터 무한 루프 방지)

### 3.5 새 토큰으로 원래 요청 재시도
```typescript
const { accessToken } = response.data.data;
localStorage.setItem('accessToken', accessToken);

originalRequest.headers.Authorization = `Bearer ${accessToken}`;
return apiClient(originalRequest);  // 원래 요청 다시 실행!
```

### 3.6 갱신 실패 시 로그아웃
```typescript
} catch (refreshError) {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
  return Promise.reject(refreshError);
}
```

---

## 4. 왜 `_retry`에 언더스코어(`_`)를 붙이나요?

### 컨벤션 (관례)
```typescript
_retry      // 내부적으로만 사용하는 속성
__private   // 더 강조할 때
```

- **의미**: "이건 원래 API에 있는 속성이 아니라, 우리가 임시로 추가한 것"
- 다른 개발자가 보면: "아, 이건 내부 로직용 속성이구나" 이해 가능

### 비슷한 예시
```typescript
// React에서
_isMounted: boolean;  // 컴포넌트 마운트 상태 추적용

// Node.js에서
_readableState      // 내부 상태 객체
```

---

## 5. `?.` 옵셔널 체이닝

```typescript
error.response?.status === 401
error.response?.data?.error
```

### 의미
```typescript
// 이것과 같음
error.response && error.response.status === 401

// 만약 response가 undefined면?
error.response?.status  // → undefined (에러 안 남)
error.response.status   // → TypeError! (에러 발생)
```

---

## 6. 실제 동작 시나리오

### 시나리오 1: 정상 요청
```
1. GET /api/v1/interviews 요청
2. Request 인터셉터: Authorization 헤더에 토큰 추가
3. 서버 응답: 200 OK + 데이터
4. Response 인터셉터: 그대로 반환
5. 컴포넌트에서 데이터 사용
```

### 시나리오 2: 토큰 만료 → 갱신 성공
```
1. GET /api/v1/interviews 요청
2. 서버 응답: 401 Unauthorized
3. Response 인터셉터:
   - _retry = false 확인 → 갱신 시도
   - _retry = true 설정
   - POST /auth/refresh 요청
   - 새 토큰 저장
   - 원래 요청 재시도
4. 서버 응답: 200 OK
5. 컴포넌트에서 데이터 사용 (사용자는 모름!)
```

### 시나리오 3: 토큰 갱신도 실패
```
1. GET /api/v1/interviews 요청
2. 서버 응답: 401 Unauthorized
3. Response 인터셉터:
   - POST /auth/refresh 요청
   - 서버 응답: 401 (Refresh Token도 만료)
4. catch 블록 실행:
   - 토큰 삭제
   - /login으로 리다이렉트
```

---

## 7. 핵심 요약

| 개념 | 설명 |
|------|------|
| `as` | TypeScript 타입 단언 - "이 값은 이 타입이다" |
| `&` | 교차 타입 - 두 타입을 합침 |
| `_retry` | 무한 루프 방지 플래그 |
| `?.` | 옵셔널 체이닝 - 안전한 속성 접근 |
| 인터셉터 | 요청/응답을 가로채서 처리하는 미들웨어 |

---

## 관련 파일
- `frontend/src/api/client.ts`
- `frontend/src/types/index.ts` (ApiResponse, ApiError 타입)
- `frontend/src/stores/authStore.ts` (인증 상태 관리)

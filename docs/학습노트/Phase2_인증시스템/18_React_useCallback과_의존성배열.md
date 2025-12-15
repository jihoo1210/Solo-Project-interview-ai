# React useCallback과 의존성 배열

## 질문
`useCallback`의 의존성 배열에서 경고가 발생하는 이유는?

```typescript
const naverLogin = useCallback(
  async (code: string, state: string) => {
    handleAuthSuccess(response);  // handleAuthSuccess 사용
  },
  [navigate, setLoading]  // 경고: handleAuthSuccess 누락
);
```

## 답변

### useCallback이란?
`useCallback`은 React Hook으로, **함수를 메모이제이션(캐싱)** 하여 컴포넌트가 리렌더링될 때마다 함수가 새로 생성되는 것을 방지합니다.

```typescript
// useCallback 없이
const handleClick = () => { ... }  // 리렌더링마다 새 함수 생성

// useCallback 사용
const handleClick = useCallback(() => { ... }, [dependencies])  // 의존성 변경 시에만 새 함수 생성
```

### 의존성 배열이 필요한 이유
JavaScript의 **클로저(Closure)** 때문입니다:

```typescript
const [count, setCount] = useState(0);

// 의존성 누락시: count가 변해도 함수는 처음 count(0)만 기억
const handleClick = useCallback(() => {
  console.log(count);  // 항상 0 출력 (stale closure)
}, []);  // count 누락

// 올바른 사용: count가 변할 때마다 함수 갱신
const handleClick = useCallback(() => {
  console.log(count);  // 현재 count 출력
}, [count]);  // count 포함
```

### 해결 방법
내부에서 사용하는 함수도 `useCallback`으로 감싸고 의존성에 추가:

```typescript
// 1. handleAuthSuccess를 먼저 useCallback으로 정의
const handleAuthSuccess = useCallback(
  (response: LoginResponse) => {
    localStorage.setItem('accessToken', response.accessToken);
    setUser(response.user);
  },
  [setUser]  // setUser에 의존
);

// 2. 이를 사용하는 함수의 의존성에 추가
const naverLogin = useCallback(
  async (code: string, state: string) => {
    handleAuthSuccess(response);
  },
  [navigate, setLoading, handleAuthSuccess]  // handleAuthSuccess 추가
);
```

### 핵심 포인트
- **exhaustive-deps 규칙**: 콜백 내부에서 참조하는 모든 값은 의존성 배열에 포함해야 함
- **stale closure 방지**: 의존성 누락 시 오래된 값을 참조하는 문제 발생
- **함수도 의존성**: 내부에서 호출하는 함수도 의존성으로 취급

## 관련 키워드
- useCallback
- 의존성 배열 (dependency array)
- exhaustive-deps
- 클로저 (Closure)
- stale closure
- 메모이제이션 (Memoization)

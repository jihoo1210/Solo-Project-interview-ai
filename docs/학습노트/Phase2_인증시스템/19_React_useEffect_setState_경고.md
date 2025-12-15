# React useEffect 내 동기적 setState 경고

## 질문
`useEffect` 내부에서 `setState`를 호출할 때 발생하는 경고의 원인과 해결방법은?

```
Error: Calling setState synchronously within an effect can trigger cascading renders
```

## 답변

### 정확한 원인: useSearchParams()의 참조 불안정성

`useSearchParams()`는 **매 렌더링마다 새로운 객체를 반환**합니다:

```typescript
const [searchParams] = useSearchParams();
// searchParams는 렌더링마다 새 객체 (참조가 다름)
```

**문제 코드:**
```typescript
useEffect(() => {
  const errorParam = searchParams.get('error');

  if (errorParam) {
    setError('로그인이 취소되었습니다.');  // setState 호출
    return;
  }
  // ...
}, [searchParams]);  // searchParams가 매번 새 객체라서 effect가 계속 실행됨
```

**연쇄 렌더링 발생 과정:**
```
1. 컴포넌트 마운트 → 첫 렌더링
2. useSearchParams() → 새 searchParams 객체 생성
3. useEffect 실행 (searchParams가 의존성)
4. setError() 호출 → 상태 변경
5. 리렌더링 트리거
6. useSearchParams() → 또 새 searchParams 객체 생성 (참조 다름)
7. useEffect 다시 실행 (searchParams가 변경됐다고 판단)
8. setError() 호출 → 무한 루프 또는 연쇄 렌더링
```

### 왜 useSearchParams()는 매번 새 객체를 반환하나?

React Router의 `useSearchParams()`는 내부적으로 `URLSearchParams` 객체를 생성합니다:

```typescript
// react-router 내부 동작 (간략화)
function useSearchParams() {
  const location = useLocation();
  // 매번 새 URLSearchParams 객체 생성
  return [new URLSearchParams(location.search), setSearchParams];
}
```

**URL 값은 같아도 객체 참조는 다릅니다:**
```typescript
const a = new URLSearchParams('?code=123');
const b = new URLSearchParams('?code=123');
console.log(a === b);  // false (다른 객체)
```

### 해결 방법

**핵심:** `searchParams` 객체 자체가 아닌, **추출한 값**을 의존성으로 사용

```typescript
export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  // 값을 미리 추출 (primitive 값은 비교 안정적)
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  // 렌더링 단계에서 계산 (setState 호출 없음)
  const immediateError = errorParam
    ? 'Google 로그인이 취소되었습니다.'
    : !code
      ? '인증 코드가 없습니다.'
      : null;

  useEffect(() => {
    if (immediateError) {
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (processedRef.current || !code) return;
    processedRef.current = true;

    const processLogin = async () => {
      try {
        await googleLogin(code);
      } catch (err) {
        setError(err.message);  // 비동기 콜백 내에서는 OK
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    processLogin();
  }, [code, immediateError, googleLogin, navigate]);  // searchParams 대신 code 사용

  const displayError = immediateError || error;
  // ...
}
```

### 핵심 변경점

| Before | After |
|--------|-------|
| `[searchParams]` 의존성 | `[code, immediateError]` 의존성 |
| useEffect 내에서 `setError` | 렌더링 단계에서 `immediateError` 계산 |
| searchParams 객체 참조 비교 | primitive 값(string) 비교 |

### useRef로 중복 실행 방지

React Strict Mode에서 `useEffect`가 두 번 실행될 수 있으므로:

```typescript
const processedRef = useRef(false);

useEffect(() => {
  if (processedRef.current) return;  // 이미 실행됐으면 스킵
  processedRef.current = true;

  // API 호출...
}, []);
```

**왜 useState가 아닌 useRef?**
- `useState`로 플래그 만들면 → `setProcessed(true)` → 리렌더링 → 문제 악화
- `useRef`는 값 변경해도 리렌더링 없음

### 핵심 패턴 요약

| 에러 유형 | 처리 방법 |
|----------|----------|
| URL 파라미터 에러 | 렌더링 단계에서 계산 (`immediateError`) |
| 비동기 API 에러 | useEffect 내 async 콜백에서 `setError` |
| 중복 실행 방지 | `useRef` 플래그 |

## 관련 키워드
- useSearchParams
- useEffect
- useState
- useRef
- 참조 불안정성 (referential instability)
- 동기적 setState
- 연쇄 렌더링 (cascading renders)
- Strict Mode

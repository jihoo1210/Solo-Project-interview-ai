# TypeScript 기초

> JavaScript에 정적 타입을 추가한 언어. 컴파일 시점에 오류를 잡아 런타임 에러를 방지합니다.

---

## 1. 기본 타입

```typescript
// Primitive Types
const name: string = "홍길동";
const age: number = 25;
const isStudent: boolean = true;
const nothing: null = null;
const notDefined: undefined = undefined;

// Array
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ["a", "b", "c"];

// Tuple (고정 길이 배열)
const tuple: [string, number] = ["hello", 10];

// Any (타입 검사 비활성화 - 사용 지양)
const anything: any = "무엇이든";

// Unknown (any보다 안전, 사용 전 타입 확인 필요)
const unknown: unknown = "알 수 없음";
```

---

## 2. 객체 타입

### Interface
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;          // 선택적 속성 (optional)
  readonly createdAt: string;  // 읽기 전용
}

const user: User = {
  id: 1,
  name: "홍길동",
  email: "hong@email.com",
  createdAt: "2024-01-01"
};
```

### Type Alias
```typescript
type Point = {
  x: number;
  y: number;
};

// Union Type (여러 타입 중 하나)
type Status = "pending" | "success" | "error";

// Intersection Type (타입 합치기)
type Admin = User & { role: "admin" };
```

### Interface vs Type
| 특성 | Interface | Type |
|------|-----------|------|
| 확장 | `extends` | `&` (intersection) |
| 선언 병합 | 가능 | 불가능 |
| 유니온 타입 | 불가능 | 가능 |
| 권장 사용 | 객체 구조 정의 | 유니온, 튜플, 복잡한 타입 |

---

## 3. 함수 타입

```typescript
// 기본 함수
function add(a: number, b: number): number {
  return a + b;
}

// 화살표 함수
const multiply = (a: number, b: number): number => a * b;

// 선택적 매개변수
function greet(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}!`;
}

// 기본값 매개변수
function greet2(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

// Rest 매개변수
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

// 함수 타입 정의
type CalculateFn = (a: number, b: number) => number;
const divide: CalculateFn = (a, b) => a / b;
```

---

## 4. 제네릭 (Generics)

```typescript
// 제네릭 함수
function identity<T>(value: T): T {
  return value;
}

const str = identity<string>("hello");  // string
const num = identity(42);  // 타입 추론: number

// 제네릭 인터페이스
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const userResponse: ApiResponse<User> = {
  success: true,
  data: { id: 1, name: "홍길동", email: "hong@email.com", createdAt: "2024-01-01" }
};

// 제네릭 제약 조건
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}
```

---

## 5. 유틸리티 타입

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Partial<T> - 모든 속성을 선택적으로
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; password?: string; }

// Required<T> - 모든 속성을 필수로
type RequiredUser = Required<PartialUser>;

// Pick<T, K> - 특정 속성만 선택
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string; }

// Omit<T, K> - 특정 속성 제외
type UserWithoutPassword = Omit<User, "password">;
// { id: number; name: string; email: string; }

// Record<K, V> - 키-값 타입 정의
type UserRoles = Record<string, "admin" | "user" | "guest">;
// { [key: string]: "admin" | "user" | "guest" }

// ReturnType<T> - 함수 반환 타입 추출
type AddResult = ReturnType<typeof add>;  // number
```

---

## 6. 타입 가드

```typescript
// typeof 가드
function process(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase();  // string으로 좁혀짐
  }
  return value * 2;  // number로 좁혀짐
}

// in 연산자 가드
interface Dog { bark(): void; }
interface Cat { meow(): void; }

function speak(animal: Dog | Cat) {
  if ("bark" in animal) {
    animal.bark();  // Dog
  } else {
    animal.meow();  // Cat
  }
}

// 사용자 정의 타입 가드
function isString(value: unknown): value is string {
  return typeof value === "string";
}

if (isString(someValue)) {
  console.log(someValue.toUpperCase());  // string으로 확정
}
```

---

## 7. React에서 TypeScript

```typescript
// Props 타입 정의
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

// 함수형 컴포넌트
const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

// children 포함
interface CardProps {
  title: string;
  children: React.ReactNode;
}

// 이벤트 타입
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

// useState
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);

// useRef
const inputRef = useRef<HTMLInputElement>(null);
```

---

## 8. 자주 쓰는 패턴

### API 응답 타입
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
  };
}

// 사용
async function fetchUser(id: number): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

### 이벤트 핸들러 타입
```typescript
type InputChangeHandler = React.ChangeEvent<HTMLInputElement>;
type FormSubmitHandler = React.FormEvent<HTMLFormElement>;
type ButtonClickHandler = React.MouseEvent<HTMLButtonElement>;
```

### 조건부 타입
```typescript
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>;  // "yes"
type B = IsString<number>;  // "no"
```

---

## 관련 키워드
- TypeScript
- 정적 타입
- Interface
- Type Alias
- Generics
- 유틸리티 타입
- 타입 가드
- React TypeScript

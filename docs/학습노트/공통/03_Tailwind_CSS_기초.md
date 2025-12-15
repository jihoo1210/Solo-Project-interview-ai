# Tailwind CSS 기초

> 유틸리티 우선(Utility-First) CSS 프레임워크. 미리 정의된 클래스를 조합하여 스타일링합니다.

---

## 1. 핵심 개념

### 유틸리티 클래스
```html
<!-- 기존 CSS -->
<div class="card">...</div>
<style>
.card {
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
</style>

<!-- Tailwind -->
<div class="p-4 bg-white rounded-lg shadow-md">...</div>
```

---

## 2. 레이아웃

### Flexbox
```html
<!-- 기본 flex -->
<div class="flex">...</div>

<!-- 방향 -->
<div class="flex flex-row">가로 정렬 (기본)</div>
<div class="flex flex-col">세로 정렬</div>

<!-- 정렬 -->
<div class="flex justify-center">가로 중앙</div>
<div class="flex justify-between">양 끝 정렬</div>
<div class="flex justify-end">오른쪽 정렬</div>

<div class="flex items-center">세로 중앙</div>
<div class="flex items-start">위쪽 정렬</div>
<div class="flex items-end">아래쪽 정렬</div>

<!-- 중앙 정렬 (가로 + 세로) -->
<div class="flex justify-center items-center">완전 중앙</div>

<!-- gap -->
<div class="flex gap-4">자식 간격 16px</div>
```

### Grid
```html
<div class="grid grid-cols-3 gap-4">3열 그리드</div>
<div class="grid grid-cols-2 md:grid-cols-4">반응형 그리드</div>
```

### 크기
```html
<div class="w-full">너비 100%</div>
<div class="w-1/2">너비 50%</div>
<div class="w-64">너비 256px (64 * 4)</div>
<div class="max-w-md">최대 너비 448px</div>

<div class="h-screen">화면 높이 100%</div>
<div class="min-h-screen">최소 높이 100vh</div>
```

---

## 3. 간격 (Spacing)

### Padding
```html
<div class="p-4">전체 패딩 16px</div>
<div class="px-4">좌우 패딩 16px</div>
<div class="py-4">상하 패딩 16px</div>
<div class="pt-4 pb-2">위 16px, 아래 8px</div>
```

### Margin
```html
<div class="m-4">전체 마진 16px</div>
<div class="mx-auto">가로 중앙 정렬</div>
<div class="mt-8 mb-4">위 32px, 아래 16px</div>
<div class="space-y-4">자식 요소 간 세로 간격</div>
```

### 간격 단위
| 클래스 | 값 |
|--------|-----|
| 0 | 0px |
| 1 | 4px (0.25rem) |
| 2 | 8px |
| 4 | 16px |
| 6 | 24px |
| 8 | 32px |
| 12 | 48px |
| 16 | 64px |

---

## 4. 색상

### 텍스트 색상
```html
<p class="text-gray-600">회색 텍스트</p>
<p class="text-blue-500">파란 텍스트</p>
<p class="text-red-600">빨간 텍스트</p>
<p class="text-green-500">초록 텍스트</p>
```

### 배경 색상
```html
<div class="bg-white">흰색 배경</div>
<div class="bg-gray-50">연한 회색 배경</div>
<div class="bg-blue-600">파란 배경</div>
<div class="bg-transparent">투명 배경</div>
```

### 색상 강도 (50 ~ 950)
```
50   - 매우 연함
100  - 연함
300  - 중간 연함
500  - 기본
700  - 진함
900  - 매우 진함
```

---

## 5. 텍스트

### 크기
```html
<p class="text-xs">12px</p>
<p class="text-sm">14px</p>
<p class="text-base">16px (기본)</p>
<p class="text-lg">18px</p>
<p class="text-xl">20px</p>
<p class="text-2xl">24px</p>
<p class="text-3xl">30px</p>
```

### 스타일
```html
<p class="font-bold">굵게</p>
<p class="font-medium">중간 굵기</p>
<p class="font-light">얇게</p>
<p class="italic">기울임</p>
<p class="underline">밑줄</p>
<p class="line-through">취소선</p>
<p class="text-center">가운데 정렬</p>
```

---

## 6. 테두리 & 그림자

### 테두리
```html
<div class="border">기본 테두리</div>
<div class="border-2">두꺼운 테두리</div>
<div class="border border-gray-300">회색 테두리</div>
<div class="border-t">위쪽만 테두리</div>
<div class="border-b-2 border-blue-500">아래쪽 파란 테두리</div>
```

### 둥근 모서리
```html
<div class="rounded">살짝 둥글게</div>
<div class="rounded-md">중간 둥글게</div>
<div class="rounded-lg">많이 둥글게</div>
<div class="rounded-full">완전 둥글게 (원형)</div>
```

### 그림자
```html
<div class="shadow-sm">작은 그림자</div>
<div class="shadow">기본 그림자</div>
<div class="shadow-md">중간 그림자</div>
<div class="shadow-lg">큰 그림자</div>
```

---

## 7. 반응형 디자인

### 브레이크포인트
| 접두사 | 최소 너비 |
|--------|-----------|
| (없음) | 0px (모바일) |
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

### 사용 예시
```html
<!-- 모바일: 1열, 태블릿: 2열, 데스크톱: 4열 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  ...
</div>

<!-- 모바일에서 숨김, 데스크톱에서 표시 -->
<div class="hidden lg:block">데스크톱만 표시</div>

<!-- 모바일에서 표시, 태블릿 이상에서 숨김 -->
<div class="block md:hidden">모바일만 표시</div>
```

---

## 8. 상태 변화

### Hover, Focus, Active
```html
<button class="bg-blue-500 hover:bg-blue-600">호버 시 어두워짐</button>
<input class="border focus:border-blue-500 focus:ring-2">포커스 시 강조</input>
<button class="active:scale-95">클릭 시 축소</button>
```

### Disabled
```html
<button class="bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed">
  비활성화
</button>
```

---

## 9. 자주 쓰는 조합

### 카드
```html
<div class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-xl font-bold mb-4">제목</h2>
  <p class="text-gray-600">내용</p>
</div>
```

### 버튼
```html
<!-- 기본 버튼 -->
<button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
               disabled:opacity-50 disabled:cursor-not-allowed">
  버튼
</button>

<!-- 아웃라인 버튼 -->
<button class="px-4 py-2 border border-gray-300 rounded-md text-gray-700
               hover:bg-gray-50">
  아웃라인
</button>
```

### 입력 필드
```html
<input class="w-full px-3 py-2 border border-gray-300 rounded-md
              placeholder-gray-400
              focus:outline-none focus:ring-blue-500 focus:border-blue-500"
       placeholder="입력하세요" />
```

### 중앙 정렬 레이아웃
```html
<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="max-w-md w-full">
    <!-- 내용 -->
  </div>
</div>
```

### 알림 박스
```html
<!-- 성공 -->
<div class="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
  성공 메시지
</div>

<!-- 에러 -->
<div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
  에러 메시지
</div>
```

---

## 10. 유용한 유틸리티

```html
<!-- 커서 -->
<div class="cursor-pointer">클릭 가능</div>
<div class="cursor-not-allowed">클릭 불가</div>

<!-- 투명도 -->
<div class="opacity-50">50% 투명</div>

<!-- 전환 효과 -->
<div class="transition duration-300">0.3초 전환</div>
<div class="transition-colors duration-200">색상만 전환</div>

<!-- 스크롤 -->
<div class="overflow-auto">스크롤 가능</div>
<div class="overflow-hidden">넘침 숨김</div>

<!-- 위치 -->
<div class="relative">상대 위치</div>
<div class="absolute top-0 right-0">절대 위치 (우상단)</div>
<div class="fixed bottom-4 right-4">고정 위치 (우하단)</div>
```

---

## 관련 키워드
- Tailwind CSS
- 유틸리티 우선
- 반응형 디자인
- Flexbox
- Grid
- 브레이크포인트
- 상태 클래스 (hover, focus)

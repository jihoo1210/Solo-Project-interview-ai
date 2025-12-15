# RestTemplate 기초 사용법

## 질문
> MultiValueMap, HttpHeaders, HttpEntity, restTemplate 기초 사용 방법에 대해서 알려주세요

---

## 1. MultiValueMap

**역할**: 하나의 키에 여러 값을 가질 수 있는 Map (폼 데이터 전송용)

```java
// 일반 Map vs MultiValueMap
Map<String, String> map = new HashMap<>();
map.put("name", "홍길동");
map.put("name", "김철수");  // 덮어쓰기! → "김철수"만 남음

MultiValueMap<String, String> multiMap = new LinkedMultiValueMap<>();
multiMap.add("name", "홍길동");
multiMap.add("name", "김철수");  // 둘 다 저장! → ["홍길동", "김철수"]
```

**OAuth에서 사용**:
```java
MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
params.add("code", "4/0AX4XfWi...");
params.add("client_id", "493322...");
params.add("client_secret", "GOCSPX-...");
params.add("redirect_uri", "http://localhost:5173/...");
params.add("grant_type", "authorization_code");

// 결과: code=xxx&client_id=xxx&client_secret=xxx&...
```

---

## 2. HttpHeaders

**역할**: HTTP 요청/응답의 헤더 정보 설정

```java
HttpHeaders headers = new HttpHeaders();

// Content-Type 설정 (요청 본문 형식)
headers.setContentType(MediaType.APPLICATION_JSON);           // JSON
headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED); // 폼 데이터

// Authorization 설정 (인증)
headers.setBearerAuth("ya29.a0AfH6...");  // Bearer 토큰
// 결과: Authorization: Bearer ya29.a0AfH6...

// 커스텀 헤더
headers.set("X-Custom-Header", "value");
```

**자주 쓰는 MediaType**:
| MediaType | 용도 |
|-----------|------|
| `APPLICATION_JSON` | JSON 데이터 |
| `APPLICATION_FORM_URLENCODED` | 폼 데이터 (key=value&key2=value2) |
| `MULTIPART_FORM_DATA` | 파일 업로드 |

---

## 3. HttpEntity

**역할**: HTTP 요청의 **Header + Body**를 합쳐서 하나로 만듦

```java
// 구조: HttpEntity<Body타입>(body, headers)

// Body + Header 둘 다 있는 경우
HttpEntity<MultiValueMap<String, String>> request =
    new HttpEntity<>(params, headers);

// Header만 있는 경우 (GET 요청 등)
HttpEntity<Void> request = new HttpEntity<>(headers);

// Body만 있는 경우
HttpEntity<String> request = new HttpEntity<>("body content");
```

**시각화**:
```
┌─────────────────────────────┐
│        HttpEntity           │
├─────────────────────────────┤
│  Headers:                   │
│    Content-Type: ...        │
│    Authorization: Bearer... │
├─────────────────────────────┤
│  Body:                      │
│    code=xxx&client_id=xxx   │
└─────────────────────────────┘
```

---

## 4. RestTemplate

**역할**: HTTP 요청을 보내고 응답을 받는 클라이언트

### 주요 메서드

| 메서드 | HTTP Method | 용도 |
|--------|-------------|------|
| `getForObject()` | GET | 단순 조회, 응답 Body만 |
| `getForEntity()` | GET | 조회, 응답 전체 (상태코드 포함) |
| `postForObject()` | POST | 생성, 응답 Body만 |
| `postForEntity()` | POST | 생성, 응답 전체 |
| `exchange()` | 모든 메서드 | 가장 유연함 |

### 사용 예시

```java
// 1. 단순 GET
String result = restTemplate.getForObject(
    "https://api.example.com/users/1",
    String.class
);

// 2. GET + Header 필요시 (exchange 사용)
HttpHeaders headers = new HttpHeaders();
headers.setBearerAuth(accessToken);
HttpEntity<Void> request = new HttpEntity<>(headers);

ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    HttpMethod.GET,
    request,
    GoogleUserInfo.class
);
GoogleUserInfo userInfo = response.getBody();

// 3. POST (폼 데이터)
MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
params.add("code", code);
params.add("client_id", clientId);

HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

HttpEntity<MultiValueMap<String, String>> request =
    new HttpEntity<>(params, headers);

GoogleTokenResponse token = restTemplate.postForObject(
    "https://oauth2.googleapis.com/token",
    request,
    GoogleTokenResponse.class
);
```

---

## 5. 전체 조합 예시 (OAuth Token 요청)

```java
public GoogleTokenResponse getToken(String code) {

    // 1. Body 데이터 준비 (MultiValueMap)
    MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
    params.add("code", code);
    params.add("client_id", "493322...");
    params.add("client_secret", "GOCSPX-...");
    params.add("redirect_uri", "http://localhost:5173/...");
    params.add("grant_type", "authorization_code");

    // 2. Header 설정 (HttpHeaders)
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

    // 3. Header + Body 합치기 (HttpEntity)
    HttpEntity<MultiValueMap<String, String>> request =
        new HttpEntity<>(params, headers);

    // 4. HTTP 요청 보내기 (RestTemplate)
    return restTemplate.postForObject(
        "https://oauth2.googleapis.com/token",  // URL
        request,                                  // HttpEntity
        GoogleTokenResponse.class                 // 응답 타입
    );
}
```

---

## 요약 표

| 클래스 | 역할 | 비유 |
|--------|------|------|
| `MultiValueMap` | 폼 데이터 담기 | 편지 내용 |
| `HttpHeaders` | 헤더 정보 | 편지 봉투 정보 |
| `HttpEntity` | Header + Body 합침 | 봉투에 편지 넣기 |
| `RestTemplate` | HTTP 요청 전송 | 우체부 |

---

---

## Q. postForObject vs exchange 차이?

### 핵심 차이

| 메서드 | 특징 |
|--------|------|
| `getForObject()` | GET 요청, Header 설정 **불가** |
| `postForObject()` | POST 요청, Header 설정 **가능** (HttpEntity) |
| `exchange()` | 모든 메서드, Header 설정 **가능**, 가장 유연 |

### 실제 사용 예시 (GoogleOAuthClient)

```java
// getToken(): POST + Body → postForObject 사용
return restTemplate.postForObject(url, request, GoogleTokenResponse.class);

// getUserInfo(): GET + Authorization Header 필요 → exchange 사용
// getForObject는 Header 설정 불가하므로 exchange 필수!
ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
    url, HttpMethod.GET, request, GoogleUserInfo.class
);
return response.getBody();
```

### ResponseEntity를 쓰는 이유
`exchange()`는 `ResponseEntity`를 반환. Body만 필요하면 `.getBody()` 호출.

---

## 관련 파일
- `infra/oauth/google/GoogleOAuthClient.java`
- `global/config/RestTemplateConfig.java`

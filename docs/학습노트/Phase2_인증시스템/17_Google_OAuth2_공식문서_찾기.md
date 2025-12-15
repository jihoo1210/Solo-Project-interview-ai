# Google OAuth2 공식 문서 찾기

## 질문
> Google Api 공식 문서를 찾아봐도 Oauth2 api에 대한 사용 방법이나 request param에 대한 정보가 없는데 어디서 찾아봐야 하나요?

---

## 답변

### 공식 문서 위치

**1. OAuth 2.0 전체 흐름 가이드**
```
https://developers.google.com/identity/protocols/oauth2
```

**2. 웹 서버 애플리케이션용 OAuth 2.0 (가장 중요)**
```
https://developers.google.com/identity/protocols/oauth2/web-server
```
→ 여기에 Token 요청 파라미터, User Info API 등 상세 정보 있음

**3. Token Endpoint 레퍼런스**
```
https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code
```

**4. UserInfo API (사용자 정보 조회)**
```
https://developers.google.com/identity/openid-connect/openid-connect#obtaininguserprofileinformation
```

---

### 핵심 API 정리

#### Token 교환 API
```
POST https://oauth2.googleapis.com/token

Parameters:
- code: Authorization Code (필수)
- client_id: 클라이언트 ID (필수)
- client_secret: 클라이언트 시크릿 (필수)
- redirect_uri: 리다이렉트 URI (필수)
- grant_type: "authorization_code" (필수)
```

#### 사용자 정보 API
```
GET https://www.googleapis.com/oauth2/v2/userinfo

Headers:
- Authorization: Bearer {access_token}
```

---

### 검색 팁

구글에서 검색할 때:
```
"google oauth2 token endpoint" site:developers.google.com
"google oauth2 userinfo api" site:developers.google.com
```

`site:developers.google.com`을 붙이면 공식 문서만 검색됩니다.

---

## 관련 링크
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)

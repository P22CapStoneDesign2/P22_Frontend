# 백엔드 API 명세 (프론트엔드 참조용)

> **Base URL**: `https://api.example.com` (실제 배포 주소는 `.env`의 `VITE_API_BASE_URL` 등으로 설정)  
> **인증**: JWT Bearer Token (Access Token + Refresh Token)  
> **Content-Type**: `application/json`

명세가 변경되면 이 문서와 `src/api/` 구현을 함께 갱신합니다.

---

## 공통 응답 형식

### 성공

```json
{
  "status": 200,
  "message": "성공",
  "data": {}
}
```

### 실패

```json
{
  "status": 400,
  "message": "에러 메시지",
  "data": null
}
```

---

## 공통 HTTP 상태·에러 코드

| Status | 설명 |
|--------|------|
| 400 | 잘못된 요청 (파라미터 오류) |
| 401 | 인증 실패 (토큰 없음 / 만료) |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 중복 데이터 |
| 500 | 서버 내부 오류 |

---

## 엔드포인트 요약

### 인증 / 사용자

| Method | URL | 인증 | 설명 |
|--------|-----|:----:|------|
| POST | `/api/auth/signup` | ❌ | 회원가입 |
| POST | `/api/auth/login` | ❌ | 일반 로그인 |
| GET | `/oauth2/authorization/kakao` | ❌ | Kakao 소셜 로그인 |
| POST | `/api/auth/reissue` | ❌ | Access Token 재발급 |
| POST | `/api/auth/logout` | ✅ | 로그아웃 |
| GET | `/api/users/me` | ✅ | 회원 정보 조회 |
| PATCH | `/api/users/me` | ✅ | 회원 정보 수정 |
| DELETE | `/api/users/me` | ✅ | 회원 탈퇴 |

### 교안

| Method | URL | 인증 | 권한 | 설명 |
|--------|-----|:----:|------|------|
| POST | `/api/lessons` | ✅ | PROF | 교안 생성 |
| GET | `/api/lessons` | ✅ | 모두 | 교안 목록 조회 (페이지네이션) |
| GET | `/api/lessons/{id}` | ✅ | 모두 | 교안 단건 조회 |
| PUT | `/api/lessons/{id}` | ✅ | PROF(본인)/ADMIN | 교안 수정 |
| DELETE | `/api/lessons/{id}` | ✅ | PROF(본인)/ADMIN | 교안 삭제 |
| GET | `/api/admin/lessons` | ✅ | ADMIN | 전체 교안 목록 조회 (페이지네이션) |

### 퀴즈

| Method | URL | 인증 | 권한 | 설명 |
|--------|-----|:----:|------|------|
| POST | `/api/quiz` | ✅ | PROF | 퀴즈 세트 생성 |
| GET | `/api/quiz` | ✅ | 모두 | 퀴즈 목록 조회 (페이지네이션) |
| GET | `/api/quiz/{quizId}` | ✅ | 모두 | 퀴즈 상세 조회 (문제 포함) |
| PUT | `/api/quiz/{quizId}` | ✅ | PROF(본인)/ADMIN | 퀴즈 수정 |
| DELETE | `/api/quiz/{quizId}` | ✅ | PROF(본인)/ADMIN | 퀴즈 삭제 |
| POST | `/api/quiz/{quizId}/questions` | ✅ | PROF(본인)/ADMIN | 문제 추가 |
| PUT | `/api/quiz/{quizId}/questions/{questionId}` | ✅ | PROF(본인)/ADMIN | 문제 수정 |
| DELETE | `/api/quiz/{quizId}/questions/{questionId}` | ✅ | PROF(본인)/ADMIN | 문제 삭제 |
| POST | `/api/quiz/{quizId}/submit` | ✅ | USER | 퀴즈 제출 |
| GET | `/api/quiz/wrong-answers` | ✅ | USER | 오답 목록 조회 (페이지네이션) |

---

## 1. 회원가입

**`POST /api/auth/signup`**

### Request Body

| 파라미터 | 타입 | 필수 | 설명 | 유효성 |
|----------|------|:----:|------|--------|
| username | String | ✅ | 닉네임 | 2~20자 |
| email | String | ✅ | 이메일 | 이메일 형식, 중복 불가 |
| password | String | ✅ | 비밀번호 | 8~20자, 영문+숫자+특수문자 |
| passwordConfirm | String | ✅ | 비밀번호 확인 | `password`와 일치 |

### Response

| 상황 | Status | 메시지 |
|------|--------|--------|
| 성공 | 201 | 회원가입 성공 |
| 이메일 중복 | 409 | 이미 사용 중인 이메일입니다. |
| 유효성 실패 | 400 | 비밀번호 형식이 올바르지 않습니다. |

---

## 2. 일반 로그인

**`POST /api/auth/login`**

### Request Body

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| email | String | ✅ | 이메일 |
| password | String | ✅ | 비밀번호 |

### Response (200)

```json
{
  "status": 200,
  "message": "로그인 성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer"
  }
}
```

- **Access Token** 유효기간: 30분  
- **Refresh Token** 유효기간: 7일  

---

## 3. 소셜 로그인 (Kakao OpenID Connect)

1. **`GET /oauth2/authorization/kakao`** → Kakao OIDC 인증 페이지로 리다이렉트  
2. **최종 콜백**: `https://{프론트엔드주소}/oauth2/callback?accessToken=...&refreshToken=...`

---

## 4. 토큰 재발급

**`POST /api/auth/reissue`**

Refresh Token Rotation 적용 — 재발급 시 기존 토큰 폐기.

### Request Body

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| refreshToken | String | ✅ | 기존 Refresh Token |

### Response (200)

```json
{
  "status": 200,
  "message": "토큰 재발급 성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer"
  }
}
```

---

## 5. 로그아웃

**`POST /api/auth/logout`** — 인증 필요

### Request Body

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| refreshToken | String | ✅ | 폐기할 Refresh Token |

### Response (200)

```json
{
  "status": 200,
  "message": "로그아웃 성공",
  "data": null
}
```

---

## 6. 회원 정보 조회

**`GET /api/users/me`** — 인증 필요

### Response (200)

```json
{
  "status": 200,
  "message": "조회 성공",
  "data": {
    "id": 1,
    "username": "홍길동",
    "email": "hong@example.com",
    "provider": "LOCAL",
    "role": "STUDENT",
    "createdAt": "2025-01-01T00:00:00"
  }
}
```

| 필드 | 설명 |
|------|------|
| provider | `LOCAL` / `KAKAO` |
| role | `STUDENT` / `PROFESSOR` / `ADMIN` |

---

## 7. 회원 정보 수정

**`PATCH /api/users/me`** — 인증 필요

### Request Body

| 파라미터 | 타입 | 필수 | 설명 | 유효성 |
|----------|------|:----:|------|--------|
| username | String | ❌ | 새 닉네임 | 2~20자 |
| currentPassword | String | ❌ | 현재 비밀번호 | 비밀번호 변경 시 필수 |
| newPassword | String | ❌ | 새 비밀번호 | 8~20자, 영문+숫자+특수문자 |

### Response (200)

```json
{
  "status": 200,
  "message": "회원 정보 수정 성공",
  "data": {
    "id": 1,
    "username": "새닉네임",
    "email": "hong@example.com",
    "provider": "LOCAL",
    "role": "STUDENT",
    "createdAt": "2025-01-01T00:00:00"
  }
}
```

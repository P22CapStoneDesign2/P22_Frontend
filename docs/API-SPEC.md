# 백엔드 API 명세 (프론트엔드 참조용)

> **Base URL**: `https://api.example.com` (실제 배포 주소는 `.env`의 `VITE_API_BASE_URL` 등으로 설정)
> **인증 방식**: JWT Bearer Token (Access Token + Refresh Token)
> **Content-Type**: `application/json`

회원 관련 API에서 **`username`은 이름(실명)**, **`nickname`은 닉네임(표시명)**으로 둔다.

명세가 변경되면 이 문서와 `src/api/` 구현을 함께 갱신한다.

---

## 공통 응답 형식

### 성공

```json
{ "status": 200, "message": "성공", "data": {} }
```

### 실패

```json
{ "status": 400, "message": "에러 메시지", "data": null }
```

### 공통 에러 코드

| Status | 설명 |
|--------|------|
| 400 | 잘못된 요청 (파라미터 오류) |
| 401 | 인증 실패 (토큰 없음 / 만료) |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 중복 데이터 |
| 423 | 잠금(예: 이메일 인증 시도 초과) |
| 500 | 서버 내부 오류 |

---

## 엔드포인트 요약

### 인증 / 사용자

| Method | URL | 인증 | 설명 |
|--------|-----|:----:|------|
| `POST` | `/api/auth/email/send` | ❌ | 이메일 인증번호 발송 (PROF 가입 전) |
| `POST` | `/api/auth/email/verify` | ❌ | 이메일 인증번호 검증 |
| `POST` | `/api/auth/profsignup` | ❌ | 교수(PROF) 로컬 회원가입 (이메일 인증 선행) |
| `POST` | `/api/auth/usersignup` | ❌ | 학생(USER) 카카오 소셜 가입 완료 |
| `GET` | `/api/auth/check-nickname` | ❌ | 닉네임 중복 확인 |
| `POST` | `/api/auth/login` | ❌ | 일반 로그인 (PROF) |
| `GET` | `/oauth2/authorization/kakao` | ❌ | Kakao 소셜 로그인 (USER) |
| `POST` | `/api/auth/reissue` | ❌ | Access Token 재발급 |
| `POST` | `/api/auth/logout` | ✅ | 로그아웃 |
| `GET` | `/api/users/me` | ✅ | 회원 정보 조회 |
| `PATCH` | `/api/users/me` | ✅ | 회원 정보 수정 |
| `DELETE` | `/api/users/me` | ✅ | 회원 탈퇴 |

### 교안

| Method | URL | 인증 | 권한 | 설명 |
|--------|-----|:----:|------|------|
| `POST` | `/api/lessons` | ✅ | PROF | 교안 생성 |
| `GET` | `/api/lessons` | ✅ | 모두 | 교안 목록 조회 (페이지네이션) |
| `GET` | `/api/lessons/{id}` | ✅ | 모두 | 교안 단건 조회 |
| `PUT` | `/api/lessons/{id}` | ✅ | PROF(본인)/ADMIN | 교안 수정 |
| `DELETE` | `/api/lessons/{id}` | ✅ | PROF(본인)/ADMIN | 교안 삭제 |
| `GET` | `/api/admin/lessons` | ✅ | ADMIN | 전체 교안 목록 조회 (페이지네이션) |

### 교안 PDF 뷰어 (Material)

| Method | URL | 인증 | 설명 |
|--------|-----|:----:|------|
| `GET` | `/api/lectures/{lectureId}/materials` | ✅ | 수강 강의의 교안(자료) 목록 |
| `GET` | `/api/materials/{materialId}` | ✅ | 교안(자료) 상세 |
| `GET` | `/api/materials/{materialId}/viewer` | ✅ | PDF 뷰어용 URL·메타 |
| `GET` | `/api/materials/{materialId}/pages/{pageNumber}` | ✅ | 페이지별 이미지 URL |
| `POST` | `/api/materials/{materialId}/progress` | ✅ | 학습 진행도(현재 페이지) 저장 |

권한(학생·교수·관리자)은 §15.6 참고.

### 퀴즈

| Method | URL | 인증 | 권한 | 설명 |
|--------|-----|:----:|------|------|
| `POST` | `/api/quiz` | ✅ | PROF | 퀴즈 세트 생성 |
| `GET` | `/api/quiz` | ✅ | 모두 | 퀴즈 목록 조회 (페이지네이션) |
| `GET` | `/api/quiz/{quizId}` | ✅ | 모두 | 퀴즈 상세 조회 (학생 풀이용 — 정답 제외) |
| `GET` | `/api/quiz/{quizId}/edit` | ✅ | PROF(본인)/ADMIN | 퀴즈 편집용 상세 (정답 포함) |
| `PUT` | `/api/quiz/{quizId}` | ✅ | PROF(본인)/ADMIN | 퀴즈 수정 |
| `DELETE` | `/api/quiz/{quizId}` | ✅ | PROF(본인)/ADMIN | 퀴즈 삭제 |
| `POST` | `/api/quiz/{quizId}/questions` | ✅ | PROF(본인)/ADMIN | 문제 추가 |
| `PUT` | `/api/quiz/{quizId}/questions/{questionId}` | ✅ | PROF(본인)/ADMIN | 문제 수정 |
| `DELETE` | `/api/quiz/{quizId}/questions/{questionId}` | ✅ | PROF(본인)/ADMIN | 문제 삭제 |
| `POST` | `/api/quiz/{quizId}/submit` | ✅ | USER | 퀴즈 제출 |
| `GET` | `/api/quiz/wrong-answers` | ✅ | USER | 오답 목록 조회 (페이지네이션) |

---

## 1. 교수(PROF) 회원가입

**POST** `/api/auth/profsignup`

> 성공 시 `Role.PROF` + `AuthProvider.LOCAL`로 저장된다.

### Request Body

| 파라미터 | 타입 | 필수 | 설명 | 유효성 |
|----------|------|:----:|------|--------|
| `username` | String | ✅ | 이름 | 2~20자 |
| `email` | String | ✅ | 이메일 | 이메일 형식, 중복 불가 |
| `nickname` | String | ✅ | 닉네임 | 영문·숫자·한글, 2~20자, 중복 불가 |
| `password` | String | ✅ | 비밀번호 | 8~20자, 영문+숫자+특수문자 |
| `passwordConfirm` | String | ✅ | 비밀번호 확인 | `password`와 일치 |

### Response

| 상황 | Status | 메시지 |
|------|--------|--------|
| 성공 | `201` | 회원가입 성공 |
| 비밀번호 확인 불일치 | `400` | 비밀번호 확인이 일치하지 않습니다. |
| 이메일 중복 | `409` | 이미 사용 중인 이메일입니다. |
| 닉네임 중복 | `409` | 이미 사용 중인 닉네임입니다. |
| 유효성 실패 | `400` | (필드별 메시지) |
| 이메일 미인증 | `403` | `EMAIL_NOT_VERIFIED` — Redis `ev:verified:{email}` 없이 가입 시도 시 |

### 이메일 인증 API (Redis) — 운영 메모

회원가입 전 **이메일 소유 확인** 흐름의 백엔드 내부 구현. 호출 명세는 §1-1-A·§1-1-B 참고. 이메일 키 suffix는 항상 **trim + 소문자** 정규화 값이다.

#### Redis 키 요약

| 논리 | Redis 키 패턴 | 값 | TTL(설정 키 예시) |
|------|---------------|-----|-------------------|
| 코드 + 실패 횟수 | `ev:code:{정규화이메일}` | `{failedAttempts}:{hmacHex}` | `app.email-verification.code-ttl-seconds` (기본 300초) |
| 재발송 쿨다운 | `ev:cooldown:{email}` | `1` | `resend-cooldown-seconds` |
| 발송 횟수 | `ev:send:{email}` | 숫자 문자열 | `send-window-seconds` |
| 잠금 | `ev:lock:{email}` | `1` | `lock-duration-seconds` |
| 인증 완료 | `ev:verified:{email}` | `1` | `verified-ttl-seconds` |

#### 엔드포인트

**POST** `/api/auth/email/send`

- Request Body: `{ "email": "test@example.com" }`
- 성공: `success: true` 등(백엔드 공통 래퍼와 병행 가능). 개발 시 **콘솔·메일 목(mock)** 에서 6자리 코드 확인.

**POST** `/api/auth/email/verify`

- Request Body: `{ "email": "test@example.com", "code": "123456" }`

#### 응답 형식 (예시)

성공:

```json
{
  "success": true,
  "message": "이메일 인증이 완료되었습니다."
}
```

실패:

```json
{
  "success": false,
  "message": "…",
  "errorCode": "VERIFICATION_CODE_MISMATCH"
}
```

`data` 필드는 `null`이면 JSON에서 **생략**될 수 있다.

#### verify 관련 `errorCode`

| 상황 | HTTP | `errorCode` |
|------|------|-------------|
| 코드 불일치(한도 내) | `401` | `VERIFICATION_CODE_MISMATCH` |
| 코드 없음·만료 | `404` | `VERIFICATION_NOT_FOUND_OR_EXPIRED` |
| 잠금(`ev:lock`) | `423` | `VERIFICATION_LOCKED` |
| 최대 실패로 잠금 처리 직후 | `423` | `VERIFICATION_ATTEMPTS_EXCEEDED` |

#### Postman 테스트 시나리오 (순서)

1. **인증번호 발송** — `POST` `{BASE}/api/auth/email/send`, Body `{ "email": "test@example.com" }` → `success: true`, 콘솔/목에서 6자리 코드 확인.
2. **Redis 코드 키** — `GET ev:code:test@example.com` → 값은 `0:{해시}` 형태.
3. **잘못된 코드** — `POST` `/api/auth/email/verify`, Body `{ "email": "test@example.com", "code": "000000" }` → `401`, `errorCode: VERIFICATION_CODE_MISMATCH`, 메시지에 남은 시도 횟수.
4. **실패 횟수 증가** — `GET ev:code:test@example.com` → 앞자리 숫자가 `1`, `2`, … 증가하는지 확인.
5. **올바른 코드** — 발송 시 나온 6자리로 verify → `200`, `success: true`, 메시지 `"이메일 인증이 완료되었습니다."`
6. **verified** — `GET ev:verified:test@example.com` → `1`, TTL 존재. `GET ev:code:test@example.com` → `(nil)` (성공 시 코드 키 삭제).

#### Windows + Docker Redis 디버깅

컨테이너 이름을 `redis`로 가정한다.

```bash
docker exec -it redis redis-cli
```

키 목록(패턴):

```redis
KEYS ev:*
```

운영·대용량에서는 `KEYS` 대신 **`SCAN`** 권장:

```redis
SCAN 0 MATCH ev:* COUNT 100
```

특정 이메일 예시(`test@example.com`):

```redis
GET ev:code:test@example.com
TTL ev:code:test@example.com
GET ev:verified:test@example.com
TTL ev:verified:test@example.com
GET ev:lock:test@example.com
TTL ev:lock:test@example.com
GET ev:cooldown:test@example.com
TTL ev:cooldown:test@example.com
GET ev:send:test@example.com
TTL ev:send:test@example.com
```

키 삭제(초기화):

```redis
DEL ev:code:test@example.com ev:verified:test@example.com ev:lock:test@example.com ev:cooldown:test@example.com ev:send:test@example.com
```

#### 회원가입과의 관계

백엔드 예시: `SignupUserService.registerEmailAfterVerification("test@example.com")` 호출 시

- Redis에 **`ev:verified:{email}` 없으면** → `403` + `EMAIL_NOT_VERIFIED`.
- 성공 시 DB에 사용자 저장 후 **`ev:verified:`** 키 삭제.

---

## 1-1. 학생(USER) 소셜 가입 완료

**POST** `/api/auth/usersignup`

> 카카오 동의 화면을 통과한 신규 유저가 이름·이메일·닉네임을 입력하고 호출하는 엔드포인트.
> 성공 시 `Role.USER` + `AuthProvider.KAKAO`로 저장되고 즉시 JWT가 발급된다. 흐름은 §3 소셜 로그인 참조.

### Request Body

| 파라미터 | 타입 | 필수 | 설명 | 유효성 |
|----------|------|:----:|------|--------|
| `pendingToken` | String | ✅ | 백엔드가 발급한 10분짜리 임시 토큰 (`?pendingToken=...`로 전달받음) | |
| `username` | String | ✅ | 이름 (카카오 `profile_nickname`이 기본값, 수정 가능) | 2~20자 |
| `email` | String | ✅ | 이메일 | 이메일 형식, 중복 불가 |
| `nickname` | String | ✅ | 닉네임 | 영문·숫자·한글, 2~20자, 중복 불가 |

### Response (201)

```json
{
  "status": 201,
  "message": "회원가입 성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer"
  }
}
```

| 상황 | Status | 메시지 |
|------|--------|--------|
| pending 토큰 만료·위변조 | `401` | 소셜 가입 정보가 만료되었거나 유효하지 않습니다. 카카오 로그인을 다시 시도해 주세요. |
| 이메일 중복 | `409` | 이미 사용 중인 이메일입니다. |
| 닉네임 중복 | `409` | 이미 사용 중인 닉네임입니다. |

---

## 1-1-A. 이메일 인증번호 발송

**POST** `/api/auth/email/send`

> PROF 회원가입 화면에서 호출. 입력된 이메일로 6자리 인증번호 메일을 발송한다.

### Request Body

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `email` | String | ✅ | 인증번호를 받을 이메일 |

### Response (200)

```json
{ "status": 200, "message": "인증번호가 발송되었습니다.", "data": null }
```

| 상황 | Status | 메시지 |
|------|--------|--------|
| 이메일 형식 오류 | `400` | 올바른 이메일 형식이 아닙니다. |
| 이미 가입된 이메일 | `409` | 이미 사용 중인 이메일입니다. |
| 메일 발송 실패 | `500` | 메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요. |

---

## 1-1-B. 이메일 인증번호 검증

**POST** `/api/auth/email/verify`

> 사용자가 입력한 인증번호의 일치 여부를 확인한다. PROF 가입 제출 전 선행 필요.

### Request Body

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `email` | String | ✅ | 인증번호를 발송한 이메일 |
| `code` | String | ✅ | 사용자가 입력한 인증번호 (6자리) |

### Response (200)

```json
{ "status": 200, "message": "이메일 인증이 완료되었습니다.", "data": null }
```

| 상황 | Status | 메시지 |
|------|--------|--------|
| 코드 불일치 | `400` | 인증번호가 일치하지 않습니다. |
| 코드 만료 | `400` | 인증번호가 만료되었습니다. 다시 받아 주세요. |
| 발송 이력 없음 | `404` | 발송된 인증번호가 없습니다. |

---

## 1-2. 닉네임 중복 확인

**GET** `/api/auth/check-nickname?nickname={nickname}`

> 회원가입 폼에서 입력 중 실시간 호출되는 엔드포인트.
> 중복 여부를 에러가 아닌 `200 + available` 필드로 반환한다.

### Query Parameter

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `nickname` | String | ✅ | 확인할 닉네임 |

### Response (200)

```json
// 사용 가능
{ "status": 200, "message": "사용 가능한 닉네임입니다.", "data": { "available": true } }

// 중복
{ "status": 200, "message": "이미 사용 중인 닉네임입니다.", "data": { "available": false } }
```

---

## 2. 일반 로그인

**POST** `/api/auth/login`

### Request Body

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `email` | String | ✅ | 이메일 |
| `password` | String | ✅ | 비밀번호 |

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

- Access Token 유효기간: **30분**
- Refresh Token 유효기간: **7일**

---

## 3. 소셜 로그인 (Kakao OpenID Connect)

**GET** `/oauth2/authorization/kakao` → Kakao OIDC 인증 페이지로 리다이렉트

카카오 인증 완료 후 백엔드(`OAuth2SuccessHandler`)는 **DB에 해당 카카오 계정이 존재하는지**에 따라 두 경로로 분기한다.

### 기존 유저 (DB에 존재)

바로 JWT 발급.

```
{redirect-uri}?accessToken=eyJ...&refreshToken=eyJ...
# 예: http://localhost:5174/oauth2/callback?accessToken=...&refreshToken=...
```

### 신규 유저 (DB에 없음)

DB 저장은 하지 않고, **10분짜리 pending 토큰**과 함께 정보 입력 페이지로 리다이렉트.
프론트는 이름 필드를 `kakaoName`으로 pre-fill하고 사용자가 이메일·닉네임을 입력한 뒤 `POST /api/auth/usersignup`을 호출한다(§1-1).

```
{register-uri}?pendingToken=eyJ...&kakaoName=홍길동
# 예: http://localhost:5174/oauth2/register?pendingToken=...&kakaoName=...
```

| pending 토큰 클레임 | 값 |
|---------------------|----|
| `sub` | providerId (카카오 OIDC `sub`) |
| `type` | `PENDING_SOCIAL` |
| `provider` | `KAKAO` |
| `name` | 카카오 `profile_nickname` (pre-fill용) |
| 유효기간 | 10분 |

---

## 4. 토큰 재발급

**POST** `/api/auth/reissue`

> Refresh Token Rotation 적용 — 재발급 시 기존 토큰 폐기.

### Request Body

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `refreshToken` | String | ✅ | 기존 Refresh Token |

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

**POST** `/api/auth/logout` — 인증 필요

### Request Body

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `refreshToken` | String | ✅ | 폐기할 Refresh Token |

### Response (200)

```json
{ "status": 200, "message": "로그아웃 성공", "data": null }
```

---

## 6. 회원 정보 조회

**GET** `/api/users/me` — 인증 필요

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
    "role": "USER",
    "createdAt": "2025-01-01T00:00:00"
  }
}
```

| 필드 | 설명 |
|------|------|
| `provider` | `LOCAL` / `KAKAO` |
| `role` | `USER` / `PROF` / `ADMIN` |

---

## 7. 회원 정보 수정

**PATCH** `/api/users/me` — 인증 필요

### Request Body

| 파라미터 | 타입 | 필수 | 설명 | 유효성 |
|----------|------|:----:|------|--------|
| `username` | String | ❌ | 새 닉네임 | 2~20자 |
| `currentPassword` | String | ❌ | 현재 비밀번호 (비밀번호 변경 시 필수) | |
| `newPassword` | String | ❌ | 새 비밀번호 | 8~20자, 영문+숫자+특수문자 |

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
    "role": "USER",
    "createdAt": "2025-01-01T00:00:00"
  }
}
```

---

## 8. 회원 탈퇴

**DELETE** `/api/users/me` — 인증 필요

### Request Body (optional)

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `password` | String | ❌ | 현재 비밀번호 (LOCAL 계정만 해당) |

### Response (200)

```json
{ "status": 200, "message": "회원 탈퇴 성공", "data": null }
```

---

## 9. 교안 생성

**POST** `/api/lessons` — 인증 필요, PROF

### Request Body

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `title` | String | ✅ | 교안 제목 |
| `description` | String | ❌ | 교안 설명 |

### Response (201)

```json
{
  "status": 201,
  "message": "교안 생성 성공",
  "data": {
    "id": 1,
    "title": "3장. 프로세스와 스레드",
    "description": "프로세스와 스레드의 개념을 학습합니다.",
    "createdById": 10,
    "createdByName": "김교수",
    "createdAt": "2025-01-01T00:00:00",
    "updatedAt": "2025-01-01T00:00:00"
  }
}
```

---

## 10. 교안 목록 조회

**GET** `/api/lessons` — 인증 필요

기본값: `size=10`, `sort=createdAt,DESC`

### Query Parameters (Pageable)

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `page` | Integer | 페이지 번호 (0부터, 기본값 0) |
| `size` | Integer | 페이지 크기 (기본값 10) |
| `sort` | String | 정렬 기준 (기본값 `createdAt,DESC`) |

### Response (200)

```json
{
  "status": 200,
  "message": "교안 목록 조회 성공",
  "data": {
    "content": [
      {
        "id": 1,
        "title": "3장. 프로세스와 스레드",
        "description": "프로세스와 스레드의 개념을 학습합니다.",
        "createdById": 10,
        "createdByName": "김교수",
        "createdAt": "2025-01-01T00:00:00",
        "updatedAt": "2025-01-01T00:00:00"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

---

## 11. 교안 단건 조회

**GET** `/api/lessons/{id}` — 인증 필요

### Response (200)

```json
{
  "status": 200,
  "message": "교안 조회 성공",
  "data": {
    "id": 1,
    "title": "3장. 프로세스와 스레드",
    "description": "프로세스와 스레드의 개념을 학습합니다.",
    "createdById": 10,
    "createdByName": "김교수",
    "createdAt": "2025-01-01T00:00:00",
    "updatedAt": "2025-01-01T00:00:00"
  }
}
```

---

## 12. 교안 수정

**PUT** `/api/lessons/{id}` — 인증 필요, PROF(본인)/ADMIN

### Request Body

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `title` | String | ✅ | 교안 제목 |
| `description` | String | ❌ | 교안 설명 |

### Response (200)

`data`에 수정된 교안 객체가 포함된다. (필드 구조는 §11과 동일)

---

## 13. 교안 삭제

**DELETE** `/api/lessons/{id}` — 인증 필요, PROF(본인)/ADMIN

### Response (200)

```json
{ "status": 200, "message": "교안 삭제 성공", "data": null }
```

---

## 14. 전체 교안 목록 조회 (관리자)

**GET** `/api/admin/lessons` — 인증 필요, ADMIN

기본값: `size=10`, `sort=createdAt,DESC`

### Query Parameters (Pageable)

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `page` | Integer | 페이지 번호 (0부터, 기본값 0) |
| `size` | Integer | 페이지 크기 (기본값 10) |
| `sort` | String | 정렬 기준 (기본값 `createdAt,DESC`) |

### Response (200)

`data`는 페이지 객체이며 `content`에 교안 요약 목록이 포함된다. (필드 구조는 §10과 동일)

---

## 15. 교안 PDF 뷰어 (Material)

강의(`lecture`) 단위 **교안 자료(Material)** 및 **PDF 뷰어**용 API. 기존 **`/api/lessons`** 기반 교안 CRUD(§9~§14)와 URL·도메인이 다를 수 있으니, 백엔드 구현·통합 기준을 따른다.

### 개요 (기능)

- 수강 강의의 교안(자료) 목록 조회  
- 교안(자료) 상세 조회  
- PDF 뷰어용 파일 URL·메타 조회  
- 페이지(이미지) 단건 조회  
- 학습 진행도(현재 페이지) 저장  
- 역할별 권한 검증  

**인증:** 아래 API는 모두 `Authorization: Bearer {accessToken}` 가정.

---

### 15.1 교안 목록 조회 (강의별)

**목적:** 사용자가 수강 중인 강의의 교안(자료) 목록 조회  

**GET** `/api/lectures/{lectureId}/materials`

#### Path Variable

| 변수 | 타입 | 설명 |
|------|------|------|
| `lectureId` | Long | 강의 ID |

#### Response (예시)

```json
{
  "success": true,
  "data": [
    {
      "materialId": 1,
      "title": "1주차 자료구조",
      "pageCount": 32,
      "thumbnailUrl": "https://cdn.example.com/thumb/1.png",
      "uploadedAt": "2026-05-14T12:00:00"
    }
  ]
}
```

> `thumbnailUrl` 등은 **예시**이며, 실제 CDN·스토리지 URL은 환경에 따른다.

---

### 15.2 교안 상세 조회

**목적:** 교안(자료) 기본 정보 조회  

**GET** `/api/materials/{materialId}`

#### Path Variable

| 변수 | 타입 | 설명 |
|------|------|------|
| `materialId` | Long | 자료 ID |

#### Response (예시)

```json
{
  "success": true,
  "data": {
    "materialId": 1,
    "title": "1주차 자료구조",
    "description": "스택과 큐 개념 학습",
    "pageCount": 32,
    "aspectRatio": "16:9",
    "createdBy": "교수명",
    "createdAt": "2026-05-14T12:00:00"
  }
}
```

---

### 15.3 PDF 뷰어용 파일 조회

**목적:** PDF 파일 URL 및 뷰어에 필요한 메타 정보 조회  

**GET** `/api/materials/{materialId}/viewer`

#### Path Variable

| 변수 | 타입 | 설명 |
|------|------|------|
| `materialId` | Long | 자료 ID |

#### Response (예시)

```json
{
  "success": true,
  "data": {
    "materialId": 1,
    "pdfUrl": "https://cdn.example.com/pdf/material-1.pdf",
    "pageCount": 32,
    "aspectRatio": "16:9",
    "allowDownload": false
  }
}
```

프론트는 `pdfUrl`을 `iframe` 등으로 표시할 수 있다. `allowDownload`가 `false`면 다운로드 UI 비활성화 등 정책에 맞춘다.

---

### 15.4 특정 페이지(이미지) 조회

**목적:** PDF를 페이지 단위 이미지로 조회  

**GET** `/api/materials/{materialId}/pages/{pageNumber}`

#### Path Variable

| 변수 | 타입 | 설명 |
|------|------|------|
| `materialId` | Long | 자료 ID |
| `pageNumber` | Integer | 페이지 번호(1부터 등 — 백엔드 규칙에 따름) |

#### Response (예시)

```json
{
  "success": true,
  "data": {
    "pageNumber": 3,
    "imageUrl": "https://cdn.example.com/materials/1/page-3.png"
  }
}
```

---

### 15.5 학습 진행도 저장

**목적:** 사용자의 현재 학습 페이지 저장  

**POST** `/api/materials/{materialId}/progress`  
**Content-Type:** `application/json`

#### Path Variable

| 변수 | 타입 | 설명 |
|------|------|------|
| `materialId` | Long | 자료 ID |

#### Request Body

```json
{
  "currentPage": 12
}
```

#### Response (예시)

```json
{
  "success": true,
  "message": "학습 진행도가 저장되었습니다."
}
```

---

### 15.6 권한 정책

| 역할 | 권한 |
|------|------|
| 학생(USER) | 자신이 **수강 중인 강의**의 교안만 조회·진행도 저장 가능 |
| 교수(PROF) | 자신이 **업로드한** 교안 조회 가능 |
| 관리자(ADMIN) | **전체** 조회 가능 |

#### 권한 실패 응답 (예시)

```json
{
  "success": false,
  "errorCode": "ACCESS_DENIED",
  "message": "해당 교안에 접근할 권한이 없습니다."
}
```

---

### 추천 DB 구조 (Material)

| 컬럼(논리) | 설명 |
|------------|------|
| `id` | PK |
| `lecture_id` | 소속 강의 FK |
| `title` | 제목 |
| `description` | 설명 |
| `pdf_url` | 원본 또는 변환 PDF 위치 |
| `page_count` | 총 페이지 수 |
| `aspect_ratio` | 예: `16:9` |
| `created_at` | 생성 시각 |

> 실제 테이블명·컬럼명은 백엔드 DDL과 일치시킨다. (기존 문서의 `lecture_material` 등과 통합 여부는 팀 합의)

---

### 화면 흐름 (참고)

1. 교안 목록 화면  
2. 교안 선택  
3. **viewer** API 호출 → `pdfUrl` 등 수신  
4. PDF(또는 페이지 이미지) 렌더링  
5. 이전/다음 페이지 이동  
6. **progress** API로 현재 페이지 저장  

---

### 역할 분리

| 구분 | 담당 |
|------|------|
| 프론트엔드 | PDF/이미지 화면 렌더링, 페이지 이동 UI, 현재 페이지 상태 관리 |
| 백엔드 | 권한 검증, PDF·이미지 URL 발급, 진행도 저장, 교안 메타데이터 관리 |

---

## 16. 퀴즈 세트 생성

**POST** `/api/quiz` — 인증 필요, PROF

### Request Body

```json
{
  "title": "3장 운영체제 기초 퀴즈",
  "description": "3장 내용 복습용 퀴즈입니다."
}
```

### Response (201)

```json
{
  "status": 201,
  "message": "퀴즈 생성 성공",
  "data": {
    "id": 1,
    "title": "3장 운영체제 기초 퀴즈",
    "description": "3장 내용 복습용 퀴즈입니다.",
    "professorId": 10,
    "professorName": "김교수",
    "questionCount": 0,
    "createdAt": "2025-01-01T00:00:00",
    "updatedAt": "2025-01-01T00:00:00"
  }
}
```

---

## 17. 퀴즈 목록 조회

**GET** `/api/quiz` — 인증 필요

기본값: `size=10`, `sort=createdAt,DESC`

### Query Parameters (Pageable)

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `page` | Integer | 페이지 번호 (0부터, 기본값 0) |
| `size` | Integer | 페이지 크기 (기본값 10) |
| `sort` | String | 정렬 기준 (기본값 `createdAt,DESC`) |

### Response (200)

```json
{
  "status": 200,
  "message": "퀴즈 목록 조회 성공",
  "data": {
    "content": [
      {
        "id": 1,
        "title": "3장 운영체제 기초 퀴즈",
        "description": "3장 내용 복습용 퀴즈입니다.",
        "professorId": 10,
        "professorName": "김교수",
        "questionCount": 5,
        "createdAt": "2025-01-01T00:00:00",
        "updatedAt": "2025-01-01T00:00:00"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

---

## 18. 퀴즈 상세 조회

**GET** `/api/quiz/{quizId}` — 인증 필요

### Response (200)

```json
{
  "status": 200,
  "message": "퀴즈 조회 성공",
  "data": {
    "id": 1,
    "title": "3장 운영체제 기초 퀴즈",
    "description": "3장 내용 복습용 퀴즈입니다.",
    "professorId": 10,
    "professorName": "김교수",
    "questions": [
      {
        "id": 5,
        "questionText": "프로세스와 스레드의 차이점은?",
        "questionType": "MULTIPLE_CHOICE",
        "score": 10,
        "options": [
          { "id": 1, "optionText": "프로세스는 독립된 메모리 공간을 가진다." },
          { "id": 2, "optionText": "스레드는 서로 다른 힙을 사용한다." }
        ],
        "anchorId": 3,
        "anchorTitle": "3장. 프로세스와 스레드",
        "lessonPage": 12,
        "lessonParagraph": 3
      }
    ],
    "createdAt": "2025-01-01T00:00:00",
    "updatedAt": "2025-01-01T00:00:00"
  }
}
```

> `correctAnswer`는 학생에게 노출되지 않는다. 정답이 필요한 교수/관리자 편집 화면은 §18-1을 사용한다.

---

## 18-1. 퀴즈 편집용 상세 조회 (정답 포함)

**GET** `/api/quiz/{quizId}/edit` — 인증 필요, PROF(본인) / ADMIN

> 교수 본인이 만든 퀴즈를 편집할 때 정답까지 받아 화면에 preload하기 위한 전용 엔드포인트.
> 백엔드 구현 예: `@PreAuthorize("(hasRole('PROF') and @quizService.isOwner(#quizId, principal)) or hasRole('ADMIN')")`.

### Response (200)

응답 본체는 `QuizEditResponseDto`. §18 응답에 다음이 추가된다.

- 문항 레벨 `correctAnswer: string` — 단답형은 정답 문자열, 객관식은 정답 보기 텍스트(쉼표 구분, 복수 정답 가능).
- 각 보기에 `correct: boolean` — 객관식 정답 보기 여부.

```json
{
  "status": 200,
  "message": "퀴즈 수정용 조회 성공",
  "data": {
    "id": 1,
    "title": "3장 운영체제 기초 퀴즈",
    "description": "3장 내용 복습용 퀴즈입니다.",
    "questions": [
      {
        "id": 5,
        "questionText": "프로세스와 스레드의 차이점은?",
        "questionType": "MULTIPLE_CHOICE",
        "score": 10,
        "options": [
          { "id": 1, "optionText": "프로세스는 독립된 메모리 공간을 가진다.", "correct": true },
          { "id": 2, "optionText": "스레드는 서로 다른 힙을 사용한다.", "correct": false }
        ],
        "correctAnswer": "프로세스는 독립된 메모리 공간을 가진다.",
        "explanation": "...",
        "anchorId": 3,
        "lessonPage": 12,
        "lessonParagraph": 3
      }
    ]
  }
}
```

| 상황 | Status | 메시지 |
|------|--------|--------|
| 본인 소유 아님 | `403` | 해당 퀴즈에 접근할 권한이 없습니다. |
| 존재하지 않는 ID | `404` | 퀴즈를 찾을 수 없습니다. |

프론트 매퍼([`quizDetailMapper.js`](../src/domains/quiz/mappers/quizDetailMapper.js))는 응답에서 보기별 `correct`를 우선 읽고, 없으면 `correctAnswer` 텍스트를 보기 텍스트와 매칭해 폴백한다.

---

## 19. 퀴즈 수정

**PUT** `/api/quiz/{quizId}` — 인증 필요, PROF(본인)/ADMIN

### Request Body

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `title` | String | ✅ | 퀴즈 제목 |
| `description` | String | ❌ | 퀴즈 설명 |

### Response (200)

`data`에 수정된 퀴즈 세트 메타데이터가 포함된다.

---

## 20. 퀴즈 삭제

**DELETE** `/api/quiz/{quizId}` — 인증 필요, PROF(본인)/ADMIN

### Response (200)

```json
{ "status": 200, "message": "퀴즈 삭제 성공", "data": null }
```

---

## 21. 문제 추가

**POST** `/api/quiz/{quizId}/questions` — 인증 필요, PROF(본인)/ADMIN

교수는 문제가 교안의 어느 페이지/문단에서 왔는지 `anchorId`, `lessonPage`, `lessonParagraph`로 지정한다.

### Request Body — 객관식 예시

```json
{
  "questionText": "프로세스와 스레드의 차이점은?",
  "questionType": "MULTIPLE_CHOICE",
  "options": [
    { "optionText": "프로세스는 독립된 메모리 공간을 가진다.", "correct": true },
    { "optionText": "스레드는 서로 다른 힙을 사용한다.", "correct": false },
    { "optionText": "프로세스 생성이 스레드보다 빠르다.", "correct": false },
    { "optionText": "스레드는 컨텍스트 스위칭 비용이 더 크다.", "correct": false }
  ],
  "correctAnswer": "프로세스는 독립된 메모리 공간을 가진다.",
  "explanation": "프로세스는 독립적인 메모리 공간을 가지지만, 스레드는 같은 프로세스 내에서 힙/데이터 영역을 공유합니다.",
  "score": 10,
  "anchorId": 3,
  "lessonPage": 12,
  "lessonParagraph": 3
}
```

### Request Body — 단답형 예시

```json
{
  "questionText": "CPU 스케줄링 알고리즘 중 비선점 방식을 하나 서술하시오.",
  "questionType": "SHORT_ANSWER",
  "options": [],
  "correctAnswer": "FCFS",
  "explanation": "FCFS(First Come First Served)는 도착 순서대로 처리하는 비선점 스케줄링입니다.",
  "score": 5,
  "anchorId": 3,
  "lessonPage": 15,
  "lessonParagraph": 1
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `questionText` | String | ✅ | 문제 내용 |
| `questionType` | String | ✅ | `MULTIPLE_CHOICE` / `SHORT_ANSWER` |
| `options` | Array | ❌ | 객관식 보기 목록 |
| `correctAnswer` | String | ✅ | 정답 텍스트 |
| `explanation` | String | ❌ | 해설 |
| `score` | Integer | ✅ | 배점 (0 이상) |
| `anchorId` | Long | ❌ | 참조 교안 ID |
| `lessonPage` | Integer | ❌ | 교안 내 페이지 번호 |
| `lessonParagraph` | Integer | ❌ | 교안 내 문단 번호 |

### Response (201)

```json
{
  "status": 201,
  "message": "문제 추가 성공",
  "data": {
    "id": 5,
    "questionText": "프로세스와 스레드의 차이점은?",
    "questionType": "MULTIPLE_CHOICE",
    "score": 10,
    "options": [
      { "id": 1, "optionText": "프로세스는 독립된 메모리 공간을 가진다." },
      { "id": 2, "optionText": "스레드는 서로 다른 힙을 사용한다." }
    ],
    "anchorId": 3,
    "anchorTitle": "3장. 프로세스와 스레드",
    "lessonPage": 12,
    "lessonParagraph": 3
  }
}
```

---

## 22. 문제 수정

**PUT** `/api/quiz/{quizId}/questions/{questionId}` — 인증 필요, PROF(본인)/ADMIN

`questionType`은 수정 불가.

### Request Body

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `questionText` | String | ✅ | 문제 내용 |
| `options` | Array | ❌ | 객관식 보기 목록 |
| `correctAnswer` | String | ✅ | 정답 텍스트 |
| `explanation` | String | ❌ | 해설 |
| `score` | Integer | ✅ | 배점 (0 이상) |
| `anchorId` | Long | ❌ | 참조 교안 ID |
| `lessonPage` | Integer | ❌ | 교안 내 페이지 번호 |
| `lessonParagraph` | Integer | ❌ | 교안 내 문단 번호 |

### Response (200)

`data`에 수정된 문제 객체가 포함된다.

---

## 23. 문제 삭제

**DELETE** `/api/quiz/{quizId}/questions/{questionId}` — 인증 필요, PROF(본인)/ADMIN

### Response (200)

```json
{ "status": 200, "message": "문제 삭제 성공", "data": null }
```

---

## 24. 퀴즈 제출

**POST** `/api/quiz/{quizId}/submit` — 인증 필요, USER

퀴즈당 1회만 제출 가능. 재제출 시 `409` 반환.

### Request Body

```json
{
  "answers": [
    { "questionId": 5, "studentAnswer": "프로세스는 독립된 메모리 공간을 가진다." },
    { "questionId": 6, "studentAnswer": "FCFS" }
  ]
}
```

### Response (200)

```json
{
  "status": 200,
  "message": "퀴즈 제출 성공",
  "data": {
    "submissionId": 100,
    "quizId": 1,
    "quizTitle": "3장 운영체제 기초 퀴즈",
    "totalScore": 15,
    "correctCount": 2,
    "totalQuestions": 2,
    "answers": [
      {
        "questionId": 5,
        "questionText": "프로세스와 스레드의 차이점은?",
        "studentAnswer": "프로세스는 독립된 메모리 공간을 가진다.",
        "correctAnswer": "프로세스는 독립된 메모리 공간을 가진다.",
        "correct": true,
        "score": 10
      },
      {
        "questionId": 6,
        "questionText": "CPU 스케줄링 알고리즘 중 비선점 방식을 하나 서술하시오.",
        "studentAnswer": "FCFS",
        "correctAnswer": "FCFS",
        "correct": true,
        "score": 5
      }
    ],
    "submittedAt": "2025-01-01T10:00:00"
  }
}
```

---

## 25. 오답 목록 조회

**GET** `/api/quiz/wrong-answers` — 인증 필요, USER

학생이 제출한 퀴즈에서 틀린 문제 목록을 조회한다. 각 오답에 교수가 지정한 **교안 참조 정보(`lessonRef`)**가 포함된다.

기본값: `size=10`, 정렬 기준: 제출 일시 DESC

### Query Parameters (Pageable)

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `page` | Integer | 페이지 번호 (0부터, 기본값 0) |
| `size` | Integer | 페이지 크기 (기본값 10) |

### Response (200)

```json
{
  "status": 200,
  "message": "오답 목록 조회 성공",
  "data": {
    "content": [
      {
        "submissionId": 100,
        "quizId": 1,
        "quizTitle": "3장 운영체제 기초 퀴즈",
        "questionId": 7,
        "questionText": "선점 스케줄링과 비선점 스케줄링의 차이는?",
        "questionType": "SHORT_ANSWER",
        "options": [],
        "studentAnswer": "처리 순서",
        "correctAnswer": "CPU를 강제로 빼앗을 수 있는지 여부",
        "explanation": "선점 스케줄링은 실행 중인 프로세스에서 CPU를 강제 회수할 수 있습니다.",
        "lessonRef": {
          "lessonId": 3,
          "lessonTitle": "3장. 프로세스와 스레드",
          "lessonPage": 18,
          "lessonParagraph": 2
        },
        "submittedAt": "2025-01-01T10:00:00"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

| 필드 | 설명 |
|------|------|
| `options` | 객관식 보기 텍스트 목록 (`List<String>`), 단답형은 빈 배열 |
| `lessonRef.lessonId` | 교안 ID |
| `lessonRef.lessonTitle` | 교안 제목 |
| `lessonRef.lessonPage` | 교수가 지정한 교안 페이지 번호 |
| `lessonRef.lessonParagraph` | 교수가 지정한 교안 문단 번호 |

> `lessonRef`는 문제 생성 시 `anchorId`를 지정하지 않은 경우 `null`이다.

---

## DB 테이블 설계 (참고)

### users

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | BIGINT | PK |
| `username` | VARCHAR(20) | 이름 |
| `nickname` | VARCHAR(20) | 닉네임 (UNIQUE) |
| `email` | VARCHAR | 이메일 (UNIQUE) |
| `password` | VARCHAR | NULL (소셜 로그인) |
| `role` | VARCHAR(10) | `USER` / `PROF` / `ADMIN` |
| `provider` | VARCHAR(10) | `LOCAL` / `KAKAO` |
| `provider_id` | VARCHAR | 소셜 로그인 시 OIDC `sub`, LOCAL은 NULL |

자세한 스키마는 [generated/db-schema.md](generated/db-schema.md) 참조.

### lecture_material (교안)

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | BIGINT | PK |
| `professor_id` | BIGINT | FK → users |
| `title` | VARCHAR(200) | 교안 제목 |
| `description` | TEXT | 교안 설명 |

### materials (PDF 뷰어 API 연동 권장)

교안 PDF 뷰어(§15)와 연동하는 **자료(Material)** 엔티티 예시. 실제 스키마는 백엔드와 일치시킨다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | BIGINT | PK |
| `lecture_id` | BIGINT | FK → lecture (강의) |
| `title` | VARCHAR(200) | 자료 제목 |
| `description` | TEXT | 설명 |
| `pdf_url` | VARCHAR(500) | PDF 저장 위치(URL) |
| `page_count` | INT | 총 페이지 수 |
| `aspect_ratio` | VARCHAR(20) | 예: `16:9` |
| `created_at` | TIMESTAMPTZ | 생성 시각 |

### quiz (퀴즈 세트)

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | BIGINT | PK |
| `professor_id` | BIGINT | FK → users |
| `title` | VARCHAR(200) | 퀴즈 제목 |
| `description` | VARCHAR(500) | 퀴즈 설명 |

### quiz_q (퀴즈 문제)

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | BIGINT | PK |
| `quiz_id` | BIGINT | FK → quiz |
| `anchor_id` | BIGINT | FK → lecture_material (NULL 가능) |
| `question_text` | TEXT | 문제 내용 |
| `q_type` | question_type | `MULTIPLE_CHOICE` / `SHORT_ANSWER` |
| `score` | INT | 배점 |
| `correct_answer` | TEXT | 정답 |
| `explanation` | TEXT | 해설 |
| `lesson_page` | INT | 교수가 지정한 교안 페이지 |
| `lesson_paragraph` | INT | 교수가 지정한 교안 문단 |

### quiz_opt (객관식 보기)

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | BIGINT | PK |
| `question_id` | BIGINT | FK → quiz_q |
| `option_text` | VARCHAR(500) | 보기 내용 |
| `is_correct` | BOOLEAN | 정답 여부 |

### quiz_sub (제출)

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | BIGINT | PK |
| `quiz_id` | BIGINT | FK → quiz |
| `student_id` | BIGINT | FK → users |
| `total_score` | INT | 총점 |
| `submitted_at` | TIMESTAMPTZ | 제출 일시 |

### quiz_sub_answer (문제별 답안)

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | BIGINT | PK |
| `submission_id` | BIGINT | FK → quiz_sub |
| `question_id` | BIGINT | FK → quiz_q |
| `student_answer` | VARCHAR(500) | 학생 답안 |
| `is_correct` | BOOLEAN | 정답 여부 |
| `score` | INT | 획득 점수 |

### refresh_tokens

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | BIGINT | PK |
| `user_id` | BIGINT | FK → users |
| `token` | VARCHAR(512) | Refresh Token |
| `expires_at` | TIMESTAMPTZ | 만료 일시 |

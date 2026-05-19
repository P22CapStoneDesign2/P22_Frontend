# ARCHITECTURE — EQH FrontEnd 구조

> **진입점**: `src/main.jsx`  
> **라우터**: React Router v7 (`BrowserRouter`)  
> 이 문서는 `CLAUDE.md`의 고수준 원칙을 프론트엔드 구현 구조로 구체화한다.  
> API 요청/응답의 상세 계약은 `docs/API-SPEC.md`를 기준으로 한다.

---

## 전체 구조

```txt
src/
├── main.jsx                   # 앱 진입점 — BrowserRouter + Routes 설정
├── index.css                  # 전역 베이스 스타일
│
├── AppLayout.jsx              # /workspace — 워크스페이스 레이아웃 (FAB 메뉴)
├── App.jsx                    # 워크스페이스 내 overview 뷰 — 퀴즈 풀기
├── LessonScript.jsx           # 워크스페이스 내 lesson 뷰 — 교안 뷰어
│
├── LoginPage.jsx              # / — 로그인 페이지
├── SignUpPage.jsx             # /signup — 일반 회원가입
├── KakaoCallbackPage.jsx      # /oauth2/callback — 카카오 OAuth2 토큰 수신·저장
├── KakaoSignUpPage.jsx        # /oauth2/signup — 카카오 최초 로그인 닉네임 입력
│
├── config/
│   └── env.js                 # import.meta.env 읽기·가공의 단일 출처
│
├── api/
│   ├── axios.js               # Axios 인스턴스, 요청/응답 인터셉터
│   ├── auth.js                # 인증·사용자 API 함수
│   └── materials.js           # 교안 PDF 뷰어용 API 함수
│
├── domains/
│   └── quiz/
│       ├── api/
│       │   └── quizApi.js     # 퀴즈 도메인 API 함수
│       └── mappers/
│           ├── quizMapper.js
│           ├── quizDetailMapper.js
│           ├── quizManagementMapper.js
│           ├── quizSubmitMapper.js
│           └── quizResultMapper.js
│
└── shared/
    ├── constants/
    │   └── routes.js          # ROUTES 상수 — 모든 라우트 경로 문자열의 단일 출처
    ├── styles/
    │   ├── buttons.css
    │   ├── eduTokens.css
    │   └── index.css
    └── icons/
        └── eduHubIcons.jsx
```

공통 API 유틸이 필요하면 아래 위치에 추가한다.

```txt
src/api/apiResponse.js         # ApiResponse<T> 언래핑 유틸
src/api/apiError.js            # API 에러 표준화 유틸
```

단, 새 유틸 파일을 추가할 때는 관련 문서와 실행 계획에 먼저 반영한다.

---

## 환경 설정 구조

환경별로 달라지는 값은 코드에 하드코딩하지 않는다.

### 단일 출처

```txt
.env
.env.example
src/config/env.js
```

### 규칙

- `import.meta.env`는 `src/config/env.js`에서만 직접 읽는다.
- 나머지 코드는 반드시 `src/config/env.js`에서 export한 상수만 사용한다.
- API base URL, 프론트 공개 URL, OAuth URL, 외부 리다이렉트 URL은 컴포넌트나 API 모듈에 직접 작성하지 않는다.
- 소스 코드에 `http://...`, `https://...` 호스트를 직접 작성하지 않는다.
- endpoint path와 host를 섞지 않는다.

예시:

```js
// 허용
import { API_BASE_URL } from '@/config/env'

// 금지
const API_BASE_URL = 'http://localhost:8080'
```

---

## 라우팅

라우트 경로 문자열은 반드시 `src/shared/constants/routes.js`의 `ROUTES` 상수를 사용한다.

| 경로 | 컴포넌트 | 인증 의도 | 현재 상태 | 설명 |
|------|----------|-----------|-----------|------|
| `/` | `LoginPage` | ❌ | 구현됨 | 로그인 |
| `/signup` | `SignUpPage` | ❌ | 구현됨 | 일반 회원가입 |
| `/oauth2/callback` | `KakaoCallbackPage` | ❌ | 구현됨 | 카카오 콜백 — URL 쿼리에서 토큰 추출·저장 후 리다이렉트 |
| `/oauth2/signup` | `KakaoSignUpPage` | ❌ | 구현됨 | 카카오 최초 로그인 — 닉네임 입력 |
| `/workspace` | `AppLayout` | ✅ | 가드 미연결 | 메인 워크스페이스 |

### 라우팅 규칙

- 새 화면을 추가할 때는 먼저 `ROUTES`에 경로를 정의한다.
- 컴포넌트에서 `navigate('/path')`, `<Link to="/path" />`처럼 라우트 문자열을 직접 작성하지 않는다.
- 인증 필요 라우트는 라우트 가드를 통해 보호한다.
- 현재 `/workspace`는 인증 필요 라우트이지만 `PrivateRoute`가 연결되어 있지 않다.
- `PrivateRoute`는 API 계층이 아니므로 `src/api/PrivateRoute.jsx`에 두지 않는다.
  - 기존 파일이 있다면 레거시로 간주한다.
  - 연결 또는 수정 시 `src/routes/PrivateRoute.jsx` 또는 `src/shared/routing/PrivateRoute.jsx`로 이동하는 것을 우선 검토한다.

---

## 워크스페이스 뷰 구조

`AppLayout`은 FAB(Floating Action Button) 메뉴로 내부 뷰를 전환한다.  
현재 워크스페이스 내부 뷰는 URL이 아니라 React 상태 `view`로 관리한다.

| view 값 | 컴포넌트 | 상태 |
|---------|----------|------|
| `lesson` | `LessonScript` | 구현됨 |
| `quiz-create` | `PlaceholderScreen` | 미구현 |
| `quiz-stats` | `PlaceholderScreen` | 미구현 |
| `overview` | `App` | 더미 데이터 기반 구현 |

### 규칙

- 워크스페이스 내부 뷰 전환은 기본적으로 `AppLayout`의 상태로 관리한다.
- 특정 뷰에 대한 직접 링크, 새로고침 복원, 브라우저 뒤로가기 지원이 필요해지면 URL 라우팅으로 전환한다.
- URL 라우팅으로 전환할 경우 `ROUTES`와 이 문서를 먼저 갱신한다.

---

## API 레이어 개요

API 호출은 다음 계층을 반드시 따른다.

```txt
컴포넌트 / 페이지 / 훅
  ↓
도메인 API 함수
  ↓
src/api/axios.js의 instance
  ↓
백엔드 API
```

### 핵심 규칙

- API 클라이언트 경계는 `src/api/axios.js`다.
- `axios` 패키지를 직접 import할 수 있는 파일은 `src/api/axios.js`뿐이다.
- `fetch`, `XMLHttpRequest`를 직접 사용하지 않는다.
- 컴포넌트·페이지·훅에서 `instance.get/post/...`를 직접 호출하지 않는다.
- 컴포넌트는 endpoint path, 인증 헤더, refresh token 처리, 응답 envelope 구조를 직접 알지 않도록 한다.
- API 요청/응답 변환은 API 모듈 또는 도메인 mapper에서 처리한다.

---

## API 모듈 위치 규칙

API 모듈은 두 위치에 둘 수 있다.

```txt
src/api/*
src/domains/<domain>/api/*
```

### `src/api/*`

여러 도메인에서 공통으로 사용하는 API를 둔다.

예:

- 인증
- 사용자
- 공통 파일
- 공통 설정
- 교안처럼 아직 독립 도메인 폴더가 없는 API

### `src/domains/<domain>/api/*`

특정 도메인에서만 사용하는 API를 둔다.

예:

```txt
src/domains/quiz/api/quizApi.js
```

### import 규칙

- API 모듈은 `src/api/axios.js`의 `instance`만 사용한다.
- 도메인 API 모듈이 axios instance를 가져올 때는 프로젝트 alias 또는 상대 경로를 사용한다.
- 컴포넌트는 `instance`를 직접 import하지 않고 도메인 API 함수만 import한다.

허용:

```js
// src/domains/quiz/api/quizApi.js
import { instance } from '../../../api/axios.js'
```

금지:

```jsx
// 컴포넌트에서 금지
import { instance } from '@/api/axios'

const res = await instance.get('/api/quiz')
```

---

## `src/api/axios.js`

`src/api/axios.js`는 네트워크 클라이언트의 유일한 경계다.

### 책임

- Axios 인스턴스 생성
- `baseURL` 설정
- timeout 설정
- 요청 인터셉터에서 Access Token 첨부
- 응답 인터셉터에서 401 감지
- Refresh Token 재발급
- 원 요청 1회 재시도
- refresh 실패 시 토큰 삭제
- 인증 만료 시 로그인 화면 이동
- refresh 제외 경로 관리

### `axios` import 규칙

`axios` 패키지를 직접 import할 수 있는 파일은 `src/api/axios.js`뿐이다.

```js
// 허용: src/api/axios.js 내부
import axios from 'axios'
```

다른 파일에서는 금지한다.

```js
// 금지
import axios from 'axios'
```

### baseURL 규칙

- `baseURL`은 `src/config/env.js`에서 export한 값을 사용한다.
- endpoint에는 host를 포함하지 않는다.
- 현재 API endpoint path는 `/api/...` 형식을 기준으로 한다.
- `VITE_API_BASE_URL`에 `/api`를 포함할지 여부는 프로젝트 환경 변수 정책과 API 모듈 path가 중복되지 않도록 한 곳에서만 결정한다.
- 중복 예: `baseURL = http://localhost:8080/api`인데 endpoint도 `/api/auth/login`으로 작성하는 경우 금지.

---

## 인증 헤더 처리

요청 인터셉터는 `localStorage.accessToken`을 읽어 인증 헤더를 첨부한다.

```txt
Authorization: Bearer <accessToken>
```

### 규칙

- Access Token 저장 키는 `accessToken`이다.
- Refresh Token 저장 키는 `refreshToken`이다.
- 토큰은 `localStorage`에만 저장한다.
- 컴포넌트에서 직접 Authorization 헤더를 조립하지 않는다.
- 인증이 필요 없는 공개 API에 토큰이 붙어 문제가 되는 경우, 제외 path를 `src/api/axios.js`에서 중앙 관리한다.

---

## 401 / Refresh Token 처리

401 처리와 토큰 재발급은 `src/api/axios.js` 응답 인터셉터에서만 수행한다.

### 필수 동작

- Access Token 만료로 401이 발생하면 Refresh Token으로 재발급을 시도한다.
- 재발급 성공 시 새 `accessToken`, `refreshToken`을 localStorage에 저장한다.
- 원래 실패한 요청은 새 Access Token으로 한 번만 재시도한다.
- 무한 재시도를 막기 위해 원 요청에 `_retry` 또는 동등한 플래그를 사용한다.
- refresh 실패 시 두 토큰을 모두 삭제하고 로그인 화면으로 이동한다.
- 403은 권한 부족으로 처리하며 refresh를 시도하지 않는다.

### Refresh Token Rotation 대응

백엔드는 Refresh Token Rotation을 사용한다.  
따라서 동시에 여러 요청이 401을 받아도 refresh 요청은 한 번만 보내야 한다.

필수 규칙:

- `isRefreshing` 또는 `refreshPromise` 방식으로 single-flight refresh를 구현한다.
- refresh 진행 중 추가로 발생한 401 요청은 기존 refresh Promise를 기다린다.
- refresh가 성공하면 대기 중인 요청을 새 Access Token으로 재시도한다.
- refresh가 실패하면 대기 중인 요청도 실패 처리하고 로그인 화면으로 이동한다.

### refresh 제외 경로

다음 요청은 자동 refresh 재시도 대상에서 제외한다.

- 로그인
- 회원가입
- 이메일 인증
- 비밀번호 재설정
- refresh 재발급 요청
- OAuth callback 관련 요청
- 기타 공개 API

제외 경로는 `AUTH_REFRESH_EXCLUDED_PATHS` 또는 동등한 상수로 `src/api/axios.js`에서 중앙 관리한다.

### 순환 의존 금지

`src/api/axios.js`는 refresh 처리를 위해 `src/api/auth.js`를 import하지 않는다.

이유:

```txt
auth.js → axios.js의 instance import
axios.js → auth.js import
```

위 구조는 순환 의존을 만들 수 있다.

따라서 refresh 요청은 `src/api/axios.js` 내부에서 처리하거나, 인터셉터 재귀를 피할 수 있는 전용 내부 클라이언트를 사용한다.

---

## API 응답 envelope 처리

백엔드의 일반 JSON 응답은 `ApiResponse<T>` 형식을 기본으로 한다.

예상 형태:

```json
{
  "success": true,
  "message": "요청에 성공했습니다.",
  "data": {}
}
```

또는 백엔드 구현에 따라 다음 필드를 포함할 수 있다.

```json
{
  "status": 200,
  "message": "요청에 성공했습니다.",
  "data": {}
}
```

### 프론트 처리 원칙

- `src/api/axios.js`는 기본적으로 AxiosResponse를 그대로 반환한다.
- 전역 인터셉터에서 `response.data.data`까지 자동 unwrap하지 않는다.
- `ApiResponse<T>`의 unwrap은 도메인 API 함수에서 처리한다.
- 컴포넌트·페이지·훅에서 `res.data.data`를 직접 접근하지 않는다.
- 도메인 API 함수는 기본적으로 화면이 사용할 `data` 값을 반환한다.
- 성공 메시지, pagination, headers, Blob 등이 필요한 경우에만 반환 형태를 명시적으로 다르게 설계한다.

권장:

```js
// src/domains/quiz/api/quizApi.js
export async function getQuizDetail(quizId) {
  const response = await instance.get(`/api/quiz/${quizId}`)
  return response.data.data
}
```

컴포넌트:

```js
const quiz = await getQuizDetail(quizId)
```

금지:

```js
const res = await getQuizDetail(quizId)
const quiz = res.data.data
```

### 예외 반환

다음 경우에는 `data`만 반환하지 않을 수 있다.

- 성공 메시지가 화면에 필요함
- pagination metadata가 필요함
- 응답 header가 필요함
- 파일 다운로드 Blob이 필요함
- HTTP status 자체가 분기 조건임

이 경우 API 함수에서 반환 형태를 명시한다.

예:

```js
export async function deleteQuiz(quizId) {
  const response = await instance.delete(`/api/quiz/${quizId}`)

  return {
    data: response.data.data,
    message: response.data.message,
  }
}
```

---

## API 에러 처리

API 에러는 공통 유틸에서 표준화한다.

권장 위치:

```txt
src/api/apiError.js
```

### 규칙

- 컴포넌트에서 AxiosError 원본을 직접 파싱하지 않는다.
- 컴포넌트에서 `error.response?.data?.message`를 반복 작성하지 않는다.
- 네트워크 실패, timeout, 서버 미응답, CORS 실패도 한국어 메시지로 변환한다.
- 백엔드가 내려준 한국어 메시지가 있으면 우선 사용한다.
- 없으면 프론트 공통 메시지를 사용한다.

표준 형태 예시:

```js
{
  status: 400,
  code: 'INVALID_INPUT',
  message: '입력값을 확인해 주세요.'
}
```

금지:

```js
const message = error.response?.data?.message
```

권장:

```js
const apiError = normalizeApiError(error)
showToast(apiError.message)
```

---

## API endpoint 문자열 규칙

### 규칙

- API endpoint 문자열은 API 모듈 내부에서만 작성한다.
- 컴포넌트·페이지·훅에서 endpoint 문자열을 작성하지 않는다.
- endpoint에는 host를 포함하지 않는다.
- endpoint path는 `docs/API-SPEC.md`와 일치해야 한다.
- 같은 endpoint가 여러 API 모듈에 중복 정의되면 안 된다.

허용:

```js
// src/api/auth.js
instance.post('/api/auth/login', payload)
```

금지:

```jsx
// 컴포넌트 내부
instance.get('/api/users/me')
```

금지:

```js
// host 하드코딩
instance.get('http://localhost:8080/api/users/me')
```

---

## `src/api/auth.js`

인증·사용자 관련 API 함수는 `src/api/auth.js`에 둔다.

### 반환 규칙

- 기본적으로 `ApiResponse<T>`의 `data`를 반환한다.
- 화면에 성공 메시지가 필요한 경우 `{ data, message }` 형태로 반환한다.
- `login`, `reissue`처럼 토큰 쌍을 받는 API는 토큰 payload를 반환한다.
- 토큰 저장은 호출부 또는 인증 흐름 담당 모듈에서 명시적으로 수행한다.
- 단, 401 refresh 인터셉터 내부 재발급 로직은 `src/api/axios.js`에서 처리한다.

| 함수 | HTTP | 경로 |
|------|------|------|
| `sendEmailCode(email)` | POST | `/api/auth/email/send` |
| `verifyEmailCode(email, code)` | POST | `/api/auth/email/verify` |
| `signup(data)` | POST | `/api/auth/profsignup` |
| `userSignup(data)` | POST | `/api/auth/usersignup` |
| `checkNickname(nickname)` | GET | `/api/auth/check-nickname` |
| `login(email, password)` | POST | `/api/auth/login` |
| `requestPasswordReset(email)` | POST | `/api/auth/password/reset-request` |
| `confirmPasswordReset(data)` | POST | `/api/auth/password/reset` |
| `reissue(refreshToken)` | POST | `/api/auth/reissue` |
| `logout(refreshToken)` | POST | `/api/auth/logout` |
| `getMe()` | GET | `/api/users/me` |
| `updateMe(data)` | PATCH | `/api/users/me` |
| `deleteMe()` | DELETE | `/api/users/me` |

### 주의

`reissue(refreshToken)` 함수가 존재하더라도, 401 인터셉터가 이 함수를 import해서 사용하지 않는다.  
순환 의존 방지를 위해 인터셉터 내부 refresh 로직은 `src/api/axios.js` 안에서 처리한다.

---

## `src/api/materials.js`

교안 PDF 뷰어용 API 함수는 `src/api/materials.js`에 둔다.

| 함수 | HTTP | 경로 |
|------|------|------|
| `getLectureMaterials(lectureId)` | GET | `/api/lectures/{lectureId}/materials` |
| `getMaterialDetail(materialId)` | GET | `/api/materials/{materialId}` |
| `getMaterialViewer(materialId)` | GET | `/api/materials/{materialId}/viewer` |
| `getMaterialPageImage(materialId, pageNumber)` | GET | `/api/materials/{materialId}/pages/{pageNumber}` |
| `postMaterialProgress(materialId, currentPage)` | POST | `/api/materials/{materialId}/progress` |

### 반환 규칙

- JSON 응답이면 기본적으로 `ApiResponse<T>`의 `data`를 반환한다.
- PDF 이미지, Blob, 파일 다운로드처럼 응답 타입이 특수한 경우 함수명 또는 주석으로 반환 형태를 명시한다.
- `parseMaterialResponse(res)` 같은 envelope 파싱 헬퍼가 필요하면 `materials.js` 내부에서만 사용한다.
- 컴포넌트가 `parseMaterialResponse(res)`를 직접 호출하지 않도록 한다.
- 컴포넌트가 `res.data.data`를 직접 접근하지 않도록 한다.

권장:

```js
const viewer = await getMaterialViewer(materialId)
```

지양:

```js
const res = await getMaterialViewer(materialId)
const viewer = parseMaterialResponse(res)
```

기존 구현이 AxiosResponse를 그대로 반환하고 있다면 레거시로 간주한다.  
신규 수정 시 API 함수 내부에서 unwrap하는 구조로 점진적으로 마이그레이션한다.

---

## `src/domains/quiz/api/quizApi.js`

퀴즈 도메인 API는 `src/domains/quiz/api/quizApi.js`에 둔다.  
명세는 `docs/API-SPEC.md`의 퀴즈 섹션을 기준으로 한다.

| 함수 | HTTP | 경로 |
|------|------|------|
| `createQuiz(payload)` | POST | `/api/quiz` |
| `getQuizzes(params?)` | GET | `/api/quiz` |
| `getQuizDetail(quizId)` | GET | `/api/quiz/{quizId}` |
| `getQuizDetailForEdit(quizId)` | GET | `/api/quiz/{quizId}/edit` (PROF 본인/ADMIN, 정답 포함) |
| `updateQuiz(quizId, payload)` | PUT | `/api/quiz/{quizId}` |
| `deleteQuiz(quizId)` | DELETE | `/api/quiz/{quizId}` |
| `addQuestion(quizId, payload)` | POST | `/api/quiz/{quizId}/questions` |
| `updateQuestion(quizId, questionId, payload)` | PUT | `/api/quiz/{quizId}/questions/{questionId}` |
| `deleteQuestion(quizId, questionId)` | DELETE | `/api/quiz/{quizId}/questions/{questionId}` |
| `submitQuiz(quizId, payload)` | POST | `/api/quiz/{quizId}/submit` |
| `getWrongAnswers(params?)` | GET | `/api/quiz/wrong-answers` |

### 반환 규칙

- 퀴즈 API 함수는 기본적으로 `ApiResponse<T>`의 `data`를 반환한다.
- 호출부가 `res.data.data`를 직접 접근하지 않는다.
- API 응답을 화면 상태로 바꾸는 작업은 mapper에서 처리한다.
- Spring Page 응답은 API 함수에서 data를 반환하고, page 구조를 테이블용 데이터로 바꾸는 작업은 mapper가 담당한다.

권장:

```js
const quiz = await getQuizDetail(quizId)
const editorBundle = mapQuizDetailToEditor(quiz)
```

금지:

```js
const res = await getQuizDetail(quizId)
const editorBundle = mapQuizDetailToEditor(res.data.data)
```

기존 구현이 AxiosResponse를 그대로 반환하고 있다면 레거시로 간주한다.  
신규 수정 시 API 함수 내부에서 unwrap하는 구조로 점진적으로 마이그레이션한다.

---

## `src/domains/quiz/mappers/`

API DTO와 화면 상태 간 변환은 mapper 모듈에 모은다.

컴포넌트는 다음 변환을 직접 수행하지 않는다.

- API 응답 DTO → 편집기 상태
- 편집기 상태 → API 요청 DTO
- Spring Page 응답 → 테이블 row
- 학생 풀이 상태 → 제출 요청 DTO
- 제출 결과 응답 → 결과 화면 모델

| 매퍼 | 방향 | 용도 |
|------|------|------|
| `quizMapper.js` | 편집기 → API | 문제 추가/수정 본문 생성, `MULTIPLE_CHOICE`/`SHORT_ANSWER` 분기 |
| `quizDetailMapper.js` | API → 편집기 | `GET /api/quiz/{id}` 응답을 편집기 preload bundle로 변환 |
| `quizManagementMapper.js` | API → 테이블 | Spring Page 응답을 관리 화면 테이블 행으로 변환 |
| `quizSubmitMapper.js` | 풀이 상태 → API | 학생 답안 객체를 `POST /api/quiz/{id}/submit` 본문으로 변환 |
| `quizResultMapper.js` | API → 결과 화면 | 제출 응답을 결과 화면 bundle로 변환, 객관식 보기 매칭 |

### mapper 규칙

- mapper는 순수 함수로 작성한다.
- mapper 내부에서 API 호출을 하지 않는다.
- mapper 내부에서 React state를 직접 변경하지 않는다.
- mapper는 입력값이 비어 있거나 일부 필드가 누락된 경우를 방어적으로 처리한다.
- API DTO 필드명이 바뀌면 mapper와 `docs/API-SPEC.md`를 함께 수정한다.

---

## OAuth / 인증 흐름

### 인증 방식

- JWT 기반 인증
- Access Token 유효기간: 30분
- Refresh Token 유효기간: 7일
- Refresh Token Rotation 적용
- 소셜 로그인: Kakao OAuth2 / OIDC

### 토큰 저장

토큰은 `localStorage`에만 저장한다.

| 토큰 | localStorage key |
|------|------------------|
| Access Token | `accessToken` |
| Refresh Token | `refreshToken` |

### Kakao OAuth callback

백엔드 콜백 후 프론트는 다음 경로로 토큰을 받는다.

```txt
/oauth2/callback?accessToken=...&refreshToken=...
```

`KakaoCallbackPage` 규칙:

1. query string에서 `accessToken`, `refreshToken`을 읽는다.
2. 즉시 localStorage에 저장한다.
3. `router replace` 또는 `window.history.replaceState`로 URL에서 토큰을 제거한다.
4. 토큰이 포함된 URL 상태에서 추가 API 호출, 로그 출력, 외부 리소스 요청을 하지 않는다.
5. 토큰 저장 후 필요한 사용자 정보 조회 또는 기본 화면 이동을 수행한다.

---

## 권한 구조

역할은 백엔드 JWT claim을 기준으로 판단한다.

| Role | 의미 |
|------|------|
| `PROF` | 강사 |
| `USER` | 학생 |
| `ADMIN` | 관리자 |

### 규칙

- 프론트의 권한 분기는 UX 보조 수단이다.
- 최종 권한 검증은 항상 백엔드가 수행한다.
- 401은 인증 필요 또는 인증 만료로 처리한다.
- 403은 권한 부족으로 처리한다.
- 403에 대해 refresh token 재발급을 시도하지 않는다.

---

## 설계 원칙

### 단일 API 클라이언트 경계

모든 API 호출은 `src/api/axios.js`의 `instance`를 경유한다.

금지:

- `axios` 직접 import
- `fetch` 직접 호출
- `XMLHttpRequest` 직접 사용
- 컴포넌트에서 `instance` 직접 호출
- 컴포넌트에서 endpoint 문자열 직접 작성

`src/shared/api/httpClient.js`가 존재한다면 사용 중지 대상으로 간주한다.  
관련 내용은 `docs/exec-plans/tech-debt-tracker.md`에 기록한다.

### 도메인 API 분리

- 공용 API는 `src/api/`에 둔다.
- 특정 도메인 전용 API는 `src/domains/<domain>/api/`에 둔다.
- 도메인 API 함수는 화면이 사용할 데이터를 반환한다.
- AxiosResponse를 그대로 외부로 노출하지 않는다.

### 매퍼 분리

API 요청·응답 변환 로직은 컴포넌트 밖에서 처리한다.

- API 호출: `api/`
- 데이터 변환: `mappers/`
- 화면 렌더링: component/page

### 라우트 상수 단일화

라우트 경로 문자열은 `ROUTES` 객체만 사용한다.

### 인터셉터 책임 집중

401 처리, 토큰 갱신, 원 요청 재시도는 인터셉터에서만 처리한다.  
컴포넌트·페이지·훅에서 중복 구현하지 않는다.

### 뷰 상태와 라우팅 분리

워크스페이스 내부 뷰 전환은 현재 React 상태로 관리한다.  
URL 기반 이동이 필요해지면 라우팅 구조를 먼저 문서화한 뒤 변경한다.

---

## 금지 패턴

다음 패턴은 허용하지 않는다.

```js
// axios 직접 import 금지
import axios from 'axios'
```

```js
// fetch 직접 호출 금지
fetch('/api/quiz')
```

```js
// 컴포넌트에서 instance 직접 호출 금지
import { instance } from '@/api/axios'

await instance.get('/api/users/me')
```

```js
// 컴포넌트에서 envelope 직접 접근 금지
const quiz = res.data.data
```

```js
// 환경 URL 하드코딩 금지
const url = 'http://localhost:8080/api/auth/login'
```

```jsx
// 라우트 문자열 하드코딩 금지
navigate('/workspace')
```

```js
// 컴포넌트에서 401 refresh 직접 처리 금지
if (error.response?.status === 401) {
  await reissue()
}
```

---

## 문서 동기화 규칙

다음 변경이 있으면 관련 문서를 함께 수정한다.

| 변경 | 수정 문서 |
|------|-----------|
| API endpoint 추가/변경 | `docs/API-SPEC.md` |
| 백엔드 API 계약 변경 | 프론트 `docs/API-SPEC.md`, 백엔드 `docs/API.md` |
| API 계층 구조 변경 | `docs/ARCHITECTURE.md` |
| 인증/인가 흐름 변경 | `docs/ARCHITECTURE.md`, `docs/SECURITY.md` |
| 환경 변수 추가/변경 | `.env.example`, `docs/ARCHITECTURE.md` |
| 라우트 추가/변경 | `ROUTES`, `docs/ARCHITECTURE.md` |
| 보안 정책 변경 | `docs/SECURITY.md` |
| 알려진 버그/해결 과정 | `docs/troubleshooting/` 또는 tech debt 문서 |

---

## 작업 전 확인 질문

구현 중 아래 중 하나라도 해당하면 즉시 멈추고 문서 또는 사용자 확인을 우선한다.

- 필요한 API가 `docs/API-SPEC.md`에 없는가?
- 응답 envelope 구조가 불명확한가?
- `data`, `message`, pagination 중 무엇을 반환해야 하는지 모호한가?
- 새 환경 변수가 필요한가?
- route 추가가 필요한가?
- 권한 기준이 모호한가?
- OAuth 또는 token 처리 흐름을 바꿔야 하는가?
- 기존 API 계층을 우회해야만 구현 가능한가?
- 백엔드 API 변경이 필요한가?
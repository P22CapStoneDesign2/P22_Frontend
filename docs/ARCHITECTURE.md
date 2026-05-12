# ARCHITECTURE — EQH FrontEnd 구조

> **진입점**: `src/main.jsx`
> **라우터**: React Router v7 (`BrowserRouter`)

---

## 전체 구조

```
src/
├── main.jsx                   # 앱 진입점 — BrowserRouter + Routes 설정
├── index.css                  # 전역 베이스 스타일
│
├── AppLayout.jsx              # /workspace — 워크스페이스 레이아웃 (FAB 메뉴)
├── App.jsx                    # 워크스페이스 내 'overview' 뷰 — 퀴즈 풀기 (더미)
├── LessonScript.jsx           # 워크스페이스 내 'lesson' 뷰 — 교안 뷰어
│
├── LoginPage.jsx              # / — 로그인 페이지
├── SignUpPage.jsx             # /signup — 일반 회원가입
├── KakaoCallbackPage.jsx      # /oauth2/callback — 카카오 OAuth2 토큰 수신·저장
├── KakaoSignUpPage.jsx        # /oauth2/signup — 카카오 최초 로그인 닉네임 입력
│
├── api/
│   ├── axios.js               # Axios 인스턴스, 요청/응답 인터셉터
│   └── auth.js                # 인증·사용자 API 함수 (signup, login, logout, getMe 등)
│
└── shared/
    ├── constants/
    │   └── routes.js          # ROUTES 상수 — 모든 경로 문자열의 단일 출처
    ├── styles/
    │   ├── buttons.css        # 공통 버튼 스타일
    │   ├── eduTokens.css      # 디자인 토큰 (색상, 간격 등)
    │   └── index.css          # shared 스타일 진입점
    └── icons/
        └── eduHubIcons.jsx    # SVG 기반 아이콘 컴포넌트
```

---

## 라우팅

| 경로 | 컴포넌트 | 인증 | 설명 |
|------|----------|------|------|
| `/` | `LoginPage` | ❌ | 로그인 |
| `/signup` | `SignUpPage` | ❌ | 일반 회원가입 |
| `/oauth2/callback` | `KakaoCallbackPage` | ❌ | 카카오 콜백 — URL 쿼리에서 토큰 추출·저장 후 리다이렉트 |
| `/oauth2/signup` | `KakaoSignUpPage` | ❌ | 카카오 최초 로그인 — 닉네임 입력 |
| `/workspace` | `AppLayout` | ✅ | 메인 워크스페이스 (교안·퀴즈 기능) |

> ⚠️ `/workspace`는 현재 라우트 가드(`PrivateRoute`) 미적용. `src/api/PrivateRoute.jsx` 파일이 존재하나 라우팅에 미연결 상태.

---

## 워크스페이스 뷰 (AppLayout 내부)

`AppLayout`은 FAB(Floating Action Button) 메뉴로 뷰를 전환합니다. 상태(`view`)로 관리되며 URL 변경 없음.

| view 값 | 컴포넌트 | 상태 |
|---------|----------|------|
| `lesson` | `LessonScript` | 구현됨 |
| `quiz-create` | `PlaceholderScreen` | 미구현 (placeholder) |
| `quiz-stats` | `PlaceholderScreen` | 미구현 (placeholder) |
| `overview` | `App` (QuizApp) | 더미 데이터 기반 구현 |

---

## API 레이어

### `src/api/axios.js`

- `VITE_API_BASE_URL`을 `baseURL`로 하는 Axios 인스턴스 생성
- **요청 인터셉터**: `localStorage.accessToken`을 `Authorization: Bearer` 헤더에 자동 첨부
- **응답 인터셉터**: 401 응답 시 `POST /api/auth/reissue`로 토큰 재발급 후 원래 요청 1회 재시도. 재발급 실패 시 토큰 삭제 후 `/`(홈)으로 리다이렉트

### `src/api/auth.js`

| 함수 | HTTP | 경로 |
|------|------|------|
| `signup(data)` | POST | `/api/auth/signup` |
| `login(email, password)` | POST | `/api/auth/login` |
| `reissue(refreshToken)` | POST | `/api/auth/reissue` |
| `logout(refreshToken)` | POST | `/api/auth/logout` |
| `getMe()` | GET | `/api/users/me` |
| `updateMe(data)` | PATCH | `/api/users/me` |
| `deleteMe()` | DELETE | `/api/users/me` |

---

## 설계 원칙

- **단일 Axios 인스턴스**: 모든 API 호출은 `src/api/axios.js`의 `instance` 경유 — 직접 `axios` 임포트 금지
- **라우트 상수 단일화**: 경로 문자열은 `ROUTES` 객체만 사용
- **인터셉터 책임 집중**: 401 처리·토큰 갱신 로직은 인터셉터에서만 — 컴포넌트 레벨 중복 금지
- **뷰 상태 vs 라우팅**: 워크스페이스 내 뷰 전환은 URL이 아닌 React 상태(`view`)로 관리

# 컴포넌트 트리 (자동 갱신 대상)

> 이 파일은 소스 코드 기반으로 유지됩니다.
> 컴포넌트 추가·제거·이동 시 이 파일도 함께 업데이트해야 합니다.
> 마지막 갱신: 2026-05-12

---

## 라우트별 컴포넌트 트리

```
BrowserRouter (main.jsx)
│
├── Route "/" → LoginPage
│
├── Route "/signup" → SignUpPage
│
├── Route "/oauth2/callback" → KakaoCallbackPage
│
├── Route "/oauth2/register" → KakaoRegisterPage
│
└── Route "/workspace" → AppLayout
    │
    ├── [view=lesson]       LessonScript
    │
    ├── [view=quiz-create]  PlaceholderScreen (title="퀴즈 생성")
    │
    ├── [view=quiz-stats]   PlaceholderScreen (title="퀴즈 통계")
    │
    └── [view=overview]     App (QuizApp)
                            ├── QuestionSidebar
                            ├── QuestionCenter
                            └── RightPanel
```

---

## 공유 모듈

```
src/shared/
├── constants/
│   └── routes.js           ROUTES { home, workspace, signup, kakaoCallback, kakaoRegister }
├── styles/
│   ├── buttons.css
│   ├── eduTokens.css
│   └── index.css
└── icons/
    └── eduHubIcons.jsx
```

---

## API 모듈 의존 관계

```
컴포넌트/페이지 → src/api/auth.js → src/api/axios.js → 백엔드
```

| 페이지/컴포넌트 | 사용하는 API 함수 |
|----------------|-----------------|
| `LoginPage` | `login` |
| `SignUpPage` | `signup` |
| `KakaoCallbackPage` | `getMe` |
| `KakaoRegisterPage` | `userSignup`, `checkNickname` |
| `AppLayout` | — |
| `LessonScript` | (미연동) |
| `App` (QuizApp) | (미연동, 더미 데이터) |

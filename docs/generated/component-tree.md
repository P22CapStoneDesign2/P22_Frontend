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
├── Route "/oauth2/signup" → KakaoSignUpPage
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
│   └── routes.js           ROUTES { home, workspace, signup, kakaoCallback, kakaoSignup }
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
컴포넌트/페이지 → src/api/{auth,materials}.js  ─┐
                  src/domains/quiz/api/quizApi.js → src/api/axios.js → 백엔드
```

모든 경로는 `src/api/axios.js`의 `instance`를 거치며, 401·토큰 재발급은 인터셉터가 담당한다.

| 페이지/컴포넌트 | 사용하는 API 함수 |
|----------------|-----------------|
| `LoginPage` | `login` |
| `SignUpPage` | `sendEmailCode`, `verifyEmailCode`, `signup`(`profsignup`), `checkNickname` |
| `KakaoCallbackPage` | `getMe` |
| `KakaoSignUpPage` | `userSignup`, `checkNickname` |
| `AppLayout` | — |
| `LessonScript` / Material 뷰어 | `getLectureMaterials`, `getMaterialDetail`, `getMaterialViewer`, `getMaterialPageImage`, `postMaterialProgress` |
| 퀴즈 화면(교수/학생) | `createQuiz`, `getQuizzes`, `getQuizDetail`, `updateQuiz`, `deleteQuiz`, `addQuestion`, `updateQuestion`, `deleteQuestion`, `submitQuiz`, `getWrongAnswers` ([active plan](../exec-plans/active/2026-05-18_quiz-backend-wiring.md) 진행 중) |

# [진행 중] 카카오 소셜 신규 가입 페이지 — `/oauth2/register` 구현

- **시작일**: 2026-05-21
- **브랜치**: dev (직접 작업)
- **관련 문서**: `docs/API-SPEC.md` §1-1, §3, `src/api/auth.js`, `src/shared/constants/routes.js`
- **관련 작업**: `2026-05-18_signup-form-api-wiring.md`(이메일 인증·닉네임 중복 확인 — 본 페이지에서 닉네임 중복 확인 재사용)

## 목표

신규 카카오 유저 로그인 흐름을 백엔드 명세에 맞춰 정상화한다. 현재 백엔드는 신규 유저를 `/oauth2/register?pendingToken=...&kakaoName=...`로 리다이렉트하지만, 프론트에 해당 라우트가 없어 404가 발생한다. 명세(`docs/API-SPEC.md` §1-1, §3)대로 pending 토큰 흐름을 받는 페이지를 신설하고, 기존의 다른 모델(이미 발급된 토큰 + `PATCH /api/users/me`)로 짜인 `KakaoSignUpPage`를 정리한다.

## 배경 — 흐름 불일치

| 백엔드 명세 (§3) | 현 프론트 |
|------------------|-----------|
| 신규 유저: `{register-uri}?pendingToken=...&kakaoName=...` | `/oauth2/register` 라우트 없음 → 404 |
| 신규 유저는 토큰 없이 pending 토큰만 받음 → `POST /api/auth/usersignup`으로 진짜 토큰 발급 | `KakaoCallbackPage`가 콜백에서 항상 토큰을 받는다고 가정, `KakaoSignUpPage`는 `PATCH /api/users/me` 호출 |

`src/api/auth.js`의 `userSignup({ pendingToken, username, email, nickname })`은 이미 정의되어 있어 API 함수 추가는 필요 없음.

## 범위

포함:
- `src/shared/constants/routes.js` — `kakaoSignup` 제거, `kakaoRegister: '/oauth2/register'` 신설
- `src/domains/auth/KakaoRegisterPage.jsx`(+ `.css`) 신규
  - 쿼리에서 `pendingToken`, `kakaoName`(URL-encoded) 읽기
  - 이름(username)은 `kakaoName`으로 pre-fill, 사용자 수정 가능 (명세 §1-1)
  - 이메일·닉네임 입력 + 닉네임 중복 확인 버튼(`checkNickname` 재사용)
  - 개인정보 동의 체크박스
  - 제출 시 `userSignup({ pendingToken, username, email, nickname })`
  - 응답 `data.data.{accessToken, refreshToken}`을 `localStorage`에 저장(`accessToken`/`refreshToken` 키)
  - `setStoredUserRole('USER')` 후 `navigate(ROUTES.studentDashboard, { replace: true })`
- `src/app/AppRoutes.jsx` — 라우트 등록 키 교체, `KakaoSignUpPage` import 제거 후 `KakaoRegisterPage`로
- `src/domains/auth/KakaoCallbackPage.jsx`
  - `needsKakaoProfile` 분기 제거 — 신규 유저는 백엔드가 `/oauth2/register`로 직접 보내므로 콜백은 항상 토큰이 있어야 함
  - `getMe()` 호출은 유지(role 판별 후 `dashboardRouteForRole`)
- `src/domains/auth/KakaoSignUpPage.jsx`, `KakaoSignUpPage.css` — **삭제**(명세와 다른 흐름, 더 이상 호출 경로 없음). 단, 입력 검증 유틸(`shared/validation/signUpProfile.js`)·CSS 일부는 신규 페이지에서 재사용
- `docs/ARCHITECTURE.md` — 카카오 가입 흐름 섹션 갱신

제외:
- pending 토큰 만료 카운트다운/타이머 UI (10분 만료) — 우선은 401 응답으로 에러 처리, 별도 PR
- 이메일 중복 확인 실시간 API (`/api/auth/check-email`은 명세에 없음) — submit 시 백엔드 409로 응답받는 방식
- 닉네임 실시간(디바운스) 검사 — 기존 SignUpPage와 동일하게 명시적 버튼 방식

## 주요 결정

| 항목 | 결정 | 근거 |
|------|------|------|
| 라우트 키 | `kakaoSignup` 제거 후 `kakaoRegister`로 신규 키 도입 | 기존 키는 `/oauth2/signup`을 가리켜 명세와 불일치. 동일 이름 유지 시 의미가 혼동됨 |
| pending 토큰 보관 | React state로만 유지, `localStorage`에 저장하지 않음 | 토큰 수명 10분 + 단일 페이지 내에서만 사용. 영속화하면 가입 흐름 이탈 후 잔존 위험 |
| `kakaoName` 디코딩 | `useSearchParams`가 자동 URL-decode | 추가 디코딩 시 이중 디코딩 위험 |
| 응답 토큰 저장 키 | `accessToken`, `refreshToken` (기존 규약) | CLAUDE.md 핵심 원칙 #4 — 동일 키 사용 |
| 가입 후 이동 | `/student` (`ROUTES.studentDashboard`) | 명세 §1-1: 응답 role이 USER 고정 |
| 기존 `KakaoSignUpPage` | 삭제 | `PATCH /api/users/me`로 프로필을 보완하는 흐름은 명세에 없음. 백엔드는 `/oauth2/register` → `POST /api/auth/usersignup` 한 경로만 사용 |
| pending 토큰 누락 시 | 안내 후 `/login`으로 이동 | 직접 URL 진입·중간 이탈 후 복귀 케이스 차단 |

## 수용 기준

- [ ] `src/shared/constants/routes.js`에 `kakaoRegister: '/oauth2/register'` 존재, `kakaoSignup` 제거
- [ ] `src/app/AppRoutes.jsx`에 `ROUTES.kakaoRegister` 라우트 등록, `KakaoSignUpPage` import 제거
- [ ] `src/domains/auth/KakaoRegisterPage.jsx` 존재 — query에서 `pendingToken`·`kakaoName` 읽고, 이름 pre-fill
- [ ] 이메일·닉네임 입력 + 닉네임 중복 확인 + 동의 체크가 모두 통과해야 "가입 완료하기" 활성화
- [ ] 닉네임 수정 시 중복 확인 상태 초기화
- [ ] 제출 → `POST /api/auth/usersignup` 호출 → 토큰 저장 → `/student`로 이동
- [ ] `pendingToken`이 쿼리에 없으면 사용자 안내 후 `/login`으로 이동
- [ ] `KakaoCallbackPage`에서 `needsKakaoProfile`·`kakaoSignup` 참조 제거
- [ ] `KakaoSignUpPage.jsx`, `KakaoSignUpPage.css` 삭제, 다른 파일에서의 import 없음
- [ ] `docs/ARCHITECTURE.md` 카카오 가입 흐름 섹션이 최신 명세와 일치
- [ ] `npm run lint` 통과 (사전 존재 에러 외 신규 에러 없음)
- [ ] `npm run build` 통과
- [ ] (수동) 백엔드 리다이렉트 URL을 직접 브라우저에 붙여넣어 페이지 진입·제출 흐름 확인

## 의사결정 로그

### 2026-05-21
- **결정**: 기존 `KakaoSignUpPage`를 보존·재구성하는 대신 삭제하고 새 페이지를 만든다. **이유**: 두 페이지의 호출 API(`PATCH /api/users/me` vs `POST /api/auth/usersignup`)와 진입 전제(이미 토큰 있음 vs pending 토큰만 있음)가 완전히 다름. 같은 파일 이름을 유지하면 git 히스토리에서 의미 변화가 모호해짐.
- **결정**: pending 토큰을 `localStorage`에 저장하지 않는다. **이유**: 10분 수명의 임시 토큰이고, 이 토큰은 가입 완료 직전 1회만 사용. 영속화 시 가입 이탈→다른 탭→다른 계정 가입 시도 등의 엣지 케이스에서 잘못된 pendingToken이 재사용될 위험.
- **결정**: 라우트 키를 `kakaoRegister`로 새로 명명. **이유**: 같은 이름을 유지하면서 경로만 바꾸면 `git blame`·검색 시 의도 추적이 어려움. 명세의 URL 의미(`/oauth2/register`)와 키 이름을 일치.

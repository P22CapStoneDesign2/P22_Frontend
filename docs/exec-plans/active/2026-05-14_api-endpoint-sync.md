# [진행 중] API 명세 동기화 — auth.js / API-SPEC.md

- **시작일**: 2026-05-14
- **브랜치**: dev (작업자: ChoiMinsik)
- **관련 문서**: `docs/API-SPEC.md`, `src/api/auth.js`

## 목표

사용자가 공유한 최신 백엔드 API 명세(EQZ Backend)에 맞춰 `docs/API-SPEC.md`와 `src/api/auth.js`를 동기화한다. 현재 둘 다 구버전 명세를 기준으로 작성되어 있어, 카카오 소셜 가입 완료·닉네임 중복 확인 등 새 엔드포인트가 누락되어 있고 role 표기·일부 엔드포인트 URL이 달라진 상태다.

## 범위

이번 계획에서 다루는 것:
- `docs/API-SPEC.md` 전체 갱신 (새 명세 반영)
- `src/api/auth.js` 누락 엔드포인트 추가 (`usersignup`, `check-nickname`)
- `signup` 함수의 인라인 코멘트 정정

이번 계획에서 다루지 않는 것 (별도 후속 작업):
- 카카오 소셜 가입 UI(`KakaoSignUpPage.jsx`)에 `userSignup` 실제 연결
- 일반 회원가입 UI(`SignUpPage.jsx`)에 `checkNickname` 실시간 연결
- 비밀번호 재설정 API(`/api/auth/password/...`) 처리 — 새 명세에 없지만 UI에서 사용 중이라 유지하기로 결정(아래 의사결정 로그 참조)

## 주요 변경점 (구 명세 → 새 명세)

| 항목 | 구 (현재 docs) | 신 (사용자 제공) |
|------|----------------|-------------------|
| 회원가입 URL | `/api/auth/signup` (역할 무관) | `/api/auth/profsignup` (교수 전용) |
| 학생 소셜 가입 완료 | 명시 없음 | `POST /api/auth/usersignup` (pendingToken 사용) |
| 닉네임 중복 확인 | 명시 없음 | `GET /api/auth/check-nickname?nickname=...` |
| Role 값 | `STUDENT` / `PROFESSOR` / `ADMIN` | `USER` / `PROF` / `ADMIN` |
| 카카오 신규 유저 콜백 | `/oauth2/callback?accessToken=...` 단일 | 분기: 기존은 callback, 신규는 `/oauth2/register?pendingToken=...&kakaoName=...` |
| `/api/users/me` 응답 | `nickname` 포함, role=STUDENT 등 | `nickname` 없음, role=USER/PROF/ADMIN |
| `PATCH /api/users/me` | username·nickname 모두 가능 | `username` (새 닉네임)만 명시 — 명세상 nickname 필드 사라짐 |
| DB users.role | STUDENT/PROFESSOR/ADMIN | USER/PROF/ADMIN, `provider_id` 컬럼 추가 |

## 수용 기준

- [x] `docs/API-SPEC.md`가 사용자 제공 새 명세와 일치 (엔드포인트 표·각 섹션·DB 스키마)
- [x] `src/api/auth.js`에 `userSignup`, `checkNickname` export 존재
- [x] `src/api/auth.js`의 `signup` 코멘트가 실제 URL(`/api/auth/profsignup`)·역할(PROF 로컬 가입)을 명시
- [x] 비밀번호 재설정 함수(`requestPasswordReset`, `confirmPasswordReset`)는 그대로 유지 (UI 호출처가 살아있음)
- [x] `npm run build`가 에러 없이 통과
- [x] `npm run lint`가 신규/수정 코드 기준 통과 (기존 `App.jsx`·`QuizCreateContent.jsx`의 사전 존재 에러 2건은 이번 작업 범위 외)

## 의사결정 로그

### 2026-05-14
- **이슈**: 첫 시도에서 CLAUDE.md 규칙 #7(작업 단계마다 docs 갱신 후 사용자 승인)을 어기고 `src/api/auth.js`만 먼저 수정함. 사용자가 이를 지적해 exec-plan부터 작성하고 `docs/API-SPEC.md`를 함께 갱신하는 방식으로 복구.
- **결정**: 비밀번호 재설정 API는 새 명세에 없어도 코드에 유지.
  **이유**: `FindPasswordModal.jsx`·`PasswordResetPage.jsx`가 호출 중이며 UI도 살아있음. 명세 부재만으로 제거하면 기능이 깨짐. 백엔드 합의 후 별도 PR로 정리.
- **결정**: `docs/API-SPEC.md`를 새 명세로 통째 갱신(부분 패치가 아닌 본문 교체 수준).
  **이유**: 차이가 단순 URL 한두 개가 아니라 role 값·DB 스키마·소셜 가입 분기까지 광범위. 부분 수정은 일관성 흐트러질 위험이 큼.
- **결정**: UI 컴포넌트에서 새 함수(`userSignup`, `checkNickname`) 실제 호출은 별도 후속 작업으로 분리.
  **이유**: 이번 작업은 "명세 동기화"라는 단일 책임에 집중. UI 연결은 폼 상태·디바운스 등 추가 설계가 필요하므로 분리.

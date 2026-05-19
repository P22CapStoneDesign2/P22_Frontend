# [보류] 페이지 셸 라우트 리팩토링 — Header를 부모 레이아웃으로 승격

- **시작일**: 2026-05-18 (계획만 기록, 작업 보류)
- **브랜치**: 미정
- **선행/연관**: `useSessionHeader` 훅은 [2026-05-18_quiz-backend-wiring.md](2026-05-18_quiz-backend-wiring.md) 중 추가됨 ([src/shared/auth/useSessionHeader.js](../../../src/shared/auth/useSessionHeader.js))

## 배경

현재 [src/app/AppRoutes.jsx](../../../src/app/AppRoutes.jsx)는 모든 라우트가 평면이고, 13개 페이지가 각자 [AppLayout](../../../src/components/layout/AppLayout/AppLayout.jsx)을 import해 `headerProps`를 직접 전달한다. 결과:

- 라우트 전환마다 Header가 언마운트/재마운트 — `useSessionHeader`의 `getMe`도 페이지 전환마다 재호출됨
- `userEmail`·`onLogout`·`logoHref`·`breadcrumbItems` 등이 페이지 13곳에 중복 (지금까지 `'professor@school.edu'`·`() => navigate('/professor')` 같은 하드코딩으로 박혀 있었음)
- 페이지 컴포넌트가 본문 외에 헤더 prop drilling까지 책임

## 목표

부모 라우트에 `AppShell`(또는 동등한 셸)을 두고 `<Outlet />`으로 자식 본문을 렌더링한다. Header는 셸에서 1회 렌더링되어 라우트 전환에 영향받지 않는다.

## 범위 (예정)

포함:
- 교수/학생 영역용 셸 라우트 도입 (예: `<Route element={<AppShell role="prof" />}>` / `role="user"`)
- 13개 페이지에서 `AppLayout` 직접 사용 제거 → 본문만 export하도록 슬림화
- breadcrumb 전달 방식 결정 (`useOutletContext` vs `useMatches()` 메타) — design-doc 1건 신규
- 로그인·회원가입·OAuth 콜백 등 헤더가 없는 라우트는 셸 밖으로 분리

제외:
- 인증 가드(`PrivateRoute`) 연결 — TD-FE-001 별도 작업
- Role 기반 메뉴 분기 — TD-FE-004 별도 작업

## 수용 기준 (예정)

- [ ] 13개 페이지 중 `AppLayout` 직접 import 0건
- [ ] 라우트 전환 시 Network 탭에서 `GET /api/users/me`가 추가 호출되지 않음 (셸 마운트 시 1회만)
- [ ] 모든 페이지에서 헤더 우상단 이메일·로그아웃이 동일하게 동작
- [ ] `docs/design-docs/`에 셸 라우트 결정 문서 1건 추가
- [ ] `npm run lint`·`npm run build` 무에러

## 의사결정 로그

### 2026-05-18 — 보류 결정

- **결정**: 퀴즈 도메인 API 연동([2026-05-18_quiz-backend-wiring.md](2026-05-18_quiz-backend-wiring.md))을 먼저 마치고, 셸 리팩토링은 별도 PR로 진행한다.
- **이유**: 셸 리팩토링은 13개 페이지를 동시에 손대야 하고 디자인 결정(`useOutletContext` vs `useMatches`)도 별도 합의가 필요. 진행 중인 퀴즈 연동과 같이 묶으면 PR 리뷰가 어려워진다.
- **임시 조치**: `useSessionHeader` 훅으로 페이지별 헤더 처리를 단일화. 퀴즈 6개 페이지에 우선 적용해 동작 확인 → 그 외 7개 페이지는 본 계획에서 일괄 처리한다.

## 후속 작업

- `useSessionHeader`의 `getMe` 결과 캐싱(셸 컨텍스트로 끌어올리면 자동 해소)
- 인증 가드(PrivateRoute) + 셸 결합 — TD-FE-001 해소 시 같이 처리

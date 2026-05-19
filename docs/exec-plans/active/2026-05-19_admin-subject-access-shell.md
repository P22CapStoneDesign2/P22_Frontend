# [진행 중] 관리자 과목 접근 권한 관리 — UI 뼈대

- **시작일**: 2026-05-19
- **브랜치**: (작업 브랜치에 맞게 기록)

## 목표

목업(3열: 과목 / 수강 학생 / 신청 학생)에 맞춰 관리자 화면 UI만 구성한다. 백엔드 API 명세가 없으므로 mock 데이터·로컬 검색만 동작한다.

## 수용 기준

- [x] `/admin/subject-access` 라우트·`ROUTES.adminSubjectAccess` 추가
- [x] ADMIN 로그인 시 해당 경로로 이동 (`postAuthNavigation`)
- [x] EDU HUB Header + 3열 패널·검색·테이블·삭제/승인 버튼 (mock alert)
- [x] `npm run build` 에러 없음
- [ ] 브라우저에서 mock 데이터·과목 선택·체크박스 동작 확인

## 의사결정 로그

- API 없음 → `MOCK_SUBJECTS` / `MOCK_STUDENTS_BY_SUBJECT` 상수, 승인·삭제는 `window.alert` 플레이스홀더.
- ADMIN 전용 `AdminAreaLayout` 추가 (교수·학생 레이아웃과 분리).
- 로그아웃 시 `localStorage` 토큰 제거 후 `ROUTES.home` (교수 레이아웃은 아직 mock navigate만 사용).

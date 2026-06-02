# [진행 중] 관리자 과목 접근 권한 관리 — UI 뼈대

- **시작일**: 2026-05-19
- **브랜치**: (작업 브랜치에 맞게 기록)

## 목표

관리자 3열 화면(교안 / 승인 수강 / 대기 신청)을 API 명세 §14·§30~§32에 맞게 연동한다.

## 수용 기준

- [x] `/admin/subject-access` 라우트·`ROUTES.adminSubjectAccess` 추가
- [x] ADMIN 로그인 시 해당 경로로 이동 (`postAuthNavigation`)
- [x] `GET /api/admin/lessons` · `GET /api/lessons/{id}/enrollments?status=` · approve/reject (`src/api/lessons.js`)
- [x] 승인·거절 결과 `window.alert`, 목록/오류 문구는 표 본문
- [ ] 브라우저에서 ADMIN 계정·백엔드 연동 확인

## 의사결정 로그

- 승인 수강 열은 `status=APPROVED`만 조회(읽기 전용). 명세에 승인 취소 API 없음 → 기존 「삭제」 버튼 제거.
- 신청 열은 `status=PENDING`, 다중 선택 후 §31 approve / §32 reject.
- ADMIN 전용 `AdminAreaLayout` 추가 (교수·학생 레이아웃과 분리).
- 로그아웃 시 `localStorage` 토큰 제거 후 `ROUTES.home` (교수 레이아웃은 아직 mock navigate만 사용).

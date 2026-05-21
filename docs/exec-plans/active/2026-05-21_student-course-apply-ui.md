# [진행 중] 학생 과목 신청 — UI (목업)

- **시작일**: 2026-05-21

## 목표

학생 목업(검색 → 과목 선택 → 신청)에 맞춰 `/student/course-apply` 화면을 구성한다. 상단바는 `StudentAreaLayout` + 공유 `Header`만 사용한다.

## 수용 기준

- [x] `ROUTES.studentCourseApply` · 라우트 연결
- [ ] 학생 대시보드 진입 경로 (요청 없음 — 대시보드 메뉴 변경하지 않음)
- [x] mock 과목 목록·검색·행 선택(보라 톤)·신청 버튼 (API 전 `alert`)
- [x] `npm run build` 성공
- [ ] 브라우저에서 목업과 레이아웃·동작 확인

## 의사결정 로그

- API 없음 → `MOCK_COURSES` 상수, 신청은 `window.alert` 플레이스홀더.
- 플레이스홀더 페이지(`StudentCourseApplyPlaceholderPage`) 제거, `course-apply/StudentCourseApplyPage`로 대체.
- 배경은 다른 학생 화면과 동일 그라데이션; `/student/course-apply` 에서만 `edu-app-layout--fullbleed` 로 헤더·본문 뷰포트 전체.

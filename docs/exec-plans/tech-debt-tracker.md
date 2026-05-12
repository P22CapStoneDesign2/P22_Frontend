# 기술 부채 추적

> 알려진 기술 부채 목록입니다. 새 기능 개발 전 여기를 확인하세요.
> 해결 시 ✅ 완료로 이동하고 날짜와 PR을 기록합니다.

---

## 🔴 높음 (High)

| ID | 항목 | 위치 | 설명 |
|----|------|------|------|
| TD-FE-001 | PrivateRoute 미연결 | `src/main.jsx`, `src/api/PrivateRoute.jsx` | `/workspace` 경로에 인증 가드 미적용 — 비로그인 사용자가 직접 URL 접근 가능 |

---

## 🟡 중간 (Medium)

| ID | 항목 | 위치 | 설명 |
|----|------|------|------|
| TD-FE-002 | 퀴즈·교안 API 모듈 부재 | `src/api/` | `auth.js`만 존재. `quiz.js`, `lesson.js` 미구현으로 서버 연동 불가 |
| TD-FE-003 | 워크스페이스 뷰 미구현 | `src/AppLayout.jsx` | `quiz-create`, `quiz-stats` 뷰가 Placeholder — 실제 기능 없음 |

---

## 🟢 낮음 (Low)

| ID | 항목 | 위치 | 설명 |
|----|------|------|------|
| TD-FE-004 | Role 기반 뷰 접근 제어 없음 | `src/AppLayout.jsx` | 학생(USER)이 교수(PROF) 전용 뷰(퀴즈 생성, 통계)에 접근 가능 |
| TD-FE-005 | 퀴즈 풀기 더미 데이터 | `src/App.jsx` | `quizData`가 하드코딩된 더미 — 서버 API 연동 필요 |

---

## ✅ 해결 완료

| ID | 항목 | 해결일 | PR |
|----|------|--------|----|

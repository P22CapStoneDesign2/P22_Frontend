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
| TD-FE-003 | 워크스페이스 뷰 미구현 | `src/AppLayout.jsx` | `quiz-stats`, 오답 뷰가 Placeholder — 실제 기능 없음 |
| TD-FE-006 | 퀴즈 화면-API 연동 미완 | `src/domains/professor/quiz-*`, `src/domains/student/quiz-*` | API 함수·매퍼는 완성됐으나 화면이 더미 데이터로 동작. [active plan](active/2026-05-18_quiz-backend-wiring.md) 참조 |
| TD-FE-007 | `httpClient.js` 사용 중지 | `src/shared/api/httpClient.js` | fetch 기반 클라이언트로, 401 자동 재발급 미지원. CLAUDE.md 규칙 #1·#4 위반. 잔존 사용처가 0이 되면 파일 삭제 |

---

## 🟢 낮음 (Low)

| ID | 항목 | 위치 | 설명 |
|----|------|------|------|
| TD-FE-004 | Role 기반 뷰 접근 제어 없음 | `src/AppLayout.jsx` | 학생(USER)이 교수(PROF) 전용 뷰(퀴즈 생성, 통계)에 접근 가능 |
| TD-FE-005 | 퀴즈 풀기 더미 데이터 | `src/App.jsx` | `quizData`가 하드코딩된 더미 — TD-FE-006으로 통합 진행 |

---

## ✅ 해결 완료

| ID | 항목 | 해결일 | PR |
|----|------|--------|----|
| TD-FE-002 | 퀴즈·교안 API 모듈 부재 | 2026-05-18 | 퀴즈는 `src/domains/quiz/api/quizApi.js` + 매퍼 5종으로 신설(axios 인스턴스 경유). 교안 PDF는 `src/api/materials.js`로 분리 완성. 잔존 화면 연동 부채는 TD-FE-006으로 분리 |

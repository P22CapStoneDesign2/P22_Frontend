# 품질 등급

> 화면·레이어별 현재 품질 상태입니다.
> 배경색 기준: 🟢 양호 / 🟡 개선 필요 / 🔴 취약

마지막 갱신: 2026-05-18

---

## 화면별 품질

| 화면 | 테스트 | 구현 완성도 | 문서화 | 종합 |
|------|--------|------------|--------|------|
| `LoginPage` | 🔴 없음 | 🟢 완성 | 🟢 PRD 기술 | 🟡 |
| `SignUpPage` | 🔴 없음 | 🟢 완성 | 🟢 PRD 기술 | 🟡 |
| `KakaoCallbackPage` | 🔴 없음 | 🟢 완성 | 🟢 설계 결정 문서화 | 🟡 |
| `KakaoSignUpPage` | 🔴 없음 | 🟢 완성 | 🟢 PRD 기술 | 🟡 |
| `AppLayout` (워크스페이스) | 🔴 없음 | 🟡 부분 구현 | 🟢 ARCHITECTURE 기술 | 🟡 |
| `LessonScript` (교안 뷰어) | 🔴 없음 | 🟡 부분 구현 | 🟡 미문서화 | 🔴 |
| `QuizManagementPage` (교수) | 🔴 없음 | 🟡 UI 완성·API 미연동 | 🟡 미문서화 | 🔴 |
| `QuizCreatePage` (교수) | 🔴 없음 | 🟡 UI 완성·API 미연동 | 🟡 미문서화 | 🔴 |
| `QuizEditPage` (교수) | 🔴 없음 | 🟡 UI 완성·API 미연동 | 🟡 미문서화 | 🔴 |
| `QuizPreviewPage` (교수) | 🔴 없음 | 🟡 UI 완성·API 미연동 | 🟡 미문서화 | 🔴 |
| `QuizMaterialSelectPage` (학생) | 🔴 없음 | 🟡 UI 완성·API 미연동 | 🟡 미문서화 | 🔴 |
| `QuizSolvePage` (학생) | 🔴 없음 | 🟡 UI 완성·API 미연동 | 🟡 미문서화 | 🔴 |
| `QuizResultPage` (학생) | 🔴 없음 | 🟡 UI 완성·API 미연동 | 🟡 미문서화 | 🔴 |

---

## 레이어별 품질

| 레이어 | 커버리지 | 규칙 강제 | 비고 |
|--------|---------|----------|------|
| API 레이어 (`src/api/`) | 🔴 없음 | 🟢 axios `instance` 강제 | 인터셉터 동작 검증 없음 |
| 도메인 API (`src/domains/<x>/api/`) | 🔴 없음 | 🟢 axios `instance` 강제 | 퀴즈 도메인만 존재 |
| 매퍼 (`src/domains/<x>/mappers/`) | 🔴 없음 | 🟢 화면-API 변환 격리 | 단위 테스트 부재 |
| 페이지 컴포넌트 | 🔴 없음 | 🔴 없음 | 렌더링·이벤트 테스트 부재 |
| 공유 컴포넌트 (`shared/`) | 🔴 없음 | 🔴 없음 | |

---

## 기능 구현 상태

| 기능 | 상태 | 비고 |
|------|------|------|
| 일반 로그인 / 회원가입 | ✅ 완성 | |
| 카카오 OAuth2 로그인 | ✅ 완성 | |
| 토큰 자동 재발급 | ✅ 완성 | 인터셉터 처리 |
| 라우트 가드 (`PrivateRoute`) | 🔴 미연결 | 파일 존재하나 Routes 미적용 |
| 교안 뷰어 | 🟡 부분 구현 | `src/api/materials.js` 완성, 화면 연동 일부 미완 |
| 퀴즈 API 모듈 | 🟢 완성 | `src/domains/quiz/api/quizApi.js` + 매퍼 5종 — axios 인스턴스 경유 |
| 퀴즈 생성 (교수) | 🟡 UI 완성 | API 연동 진행 예정 ([active plan](exec-plans/active/2026-05-18_quiz-backend-wiring.md)) |
| 퀴즈 수정 (교수) | 🟡 UI 완성 | API 연동 진행 예정 |
| 퀴즈 관리 목록 (교수) | 🟡 UI 완성 | API 연동 진행 예정 |
| 퀴즈 미리보기 (교수) | 🟡 UI 완성 | 로컬 상태 기반, 서버 미사용 |
| 퀴즈 풀기 (학생) | 🟡 UI 완성 | 더미 데이터 — 서버 연동 미완 |
| 퀴즈 결과 (학생) | 🟡 UI 완성 | 더미 데이터 — 서버 연동 미완 |
| 오답 정리 | 🔴 미구현 | `getWrongAnswers` API는 정의됨, 화면 없음 |

---

## 개선 우선순위

1. **TD-FE-001**: `PrivateRoute`를 라우팅에 연결하여 `/workspace` 인증 가드 적용
2. **TD-FE-006**: 퀴즈 화면 — API 모듈 연동 ([active plan](exec-plans/active/2026-05-18_quiz-backend-wiring.md))
3. **TD-FE-003**: 워크스페이스 내 통계·오답 뷰 구현
4. **TD-FE-004**: Role 기반 뷰 접근 제어 (PROF/USER 화면 분기)
5. **TD-FE-007**: `src/shared/api/httpClient.js` 사용 중지 후 제거

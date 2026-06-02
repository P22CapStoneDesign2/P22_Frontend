# 퀴즈 — 학생 풀이(한 문제당 한 페이지) · Viewer Mode

**상태**: 구현 완료 (검증: `npm run lint`, `npm run build`)  
**범위**: 퀴즈 화면만. ProtectedRoute·세션 만료 제외.

## 완료 항목

1. **학생 풀이** (`QuizSolveContent`): `activeQuestionIndex`, 한 문항만 렌더, 이전/다음, 마지막에만 제출, 답 유지, 이동 시 상단 스크롤, `문제 n / total` 표시.
2. **Viewer Mode**: `useIsViewerMode` + `isViewerMode`/`isEditable` — 학생(`USER`/`STUDENT`)은 편집 UI 비활성·한 문항씩 보기.
3. **API 방어**: `quizApi` 변경 메서드 + `QuizEditorContent` 핸들러 early return.

## Role

- 백엔드: `PROF` | `USER` | `ADMIN`
- 학생 판별: `USER` 또는 `STUDENT`
- 캐시: `sessionStorage` `eqh_user_role` (로그인·`useUserRole`)

## 승인

다음 단계 진행 전 사용자 확인 대기.

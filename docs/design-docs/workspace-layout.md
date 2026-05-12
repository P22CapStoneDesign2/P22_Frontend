# 설계 결정 — 워크스페이스 레이아웃

> 상태: ✅ 확정

---

## 결정 사항

### FAB 메뉴 기반 뷰 전환 (URL 라우팅 대신 React 상태)

워크스페이스(`/workspace`) 내 교안·퀴즈·통계 화면 전환은 URL 경로 변경 없이 React 상태(`view`)로 관리한다.

```
AppLayout
 ├── view === 'lesson'       → LessonScript
 ├── view === 'quiz-create'  → PlaceholderScreen
 ├── view === 'quiz-stats'   → PlaceholderScreen
 └── view === 'overview'     → App (QuizApp)
```

**이유**
- 워크스페이스는 단일 세션 내에서 교수·학생이 작업하는 SPA 컨텍스트
- 각 뷰는 독립적인 히스토리 엔트리가 불필요 (뒤로가기 = 로그아웃 페이지)
- FAB 버튼으로 언제든 전환 → URL 기반 딥링크보다 UX 우선

**대안 검토**
- `react-router` 중첩 라우트(`/workspace/lesson`, `/workspace/quiz-create`): 딥링크·북마크가 필요한 경우 도입 검토. 현재 요구사항에서는 과설계.

### FAB 외부 클릭 닫기

`mousedown` 이벤트 리스너를 `document`에 등록하여 FAB 영역 외부 클릭 시 메뉴를 닫는다.
`Escape` 키도 동일하게 처리.
`rootRef`로 FAB 컨테이너를 참조하여 내부 클릭은 메뉴 유지.

---

## 관련 파일

- `src/AppLayout.jsx` — FAB 메뉴 및 뷰 전환 로직
- `src/AppLayout.css` — FAB 스타일

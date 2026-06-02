# Design Docs — 설계 결정 목록

> 에이전트·개발자가 코드 변경 시 관련 설계 결정을 먼저 확인하세요.
> 이 파일에 없는 결정은 존재하지 않는 것으로 간주합니다 (Slack·구두 합의 금지).

| 문서 | 상태 | 대상 영역 | 요약 |
|------|------|----------|------|
| [auth-flow.md](auth-flow.md) | ✅ 확정 | api/, 인증 페이지 | JWT localStorage 저장, Axios 인터셉터 기반 토큰 자동 갱신, 카카오 OIDC 콜백 처리 |
| [workspace-layout.md](workspace-layout.md) | ✅ 확정 | AppLayout | FAB 메뉴 기반 뷰 전환 — URL 라우팅 대신 React 상태로 워크스페이스 내 화면 전환 |

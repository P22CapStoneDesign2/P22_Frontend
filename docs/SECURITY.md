# 보안 체크리스트

> 새 기능 구현 또는 PR 리뷰 시 이 목록을 확인합니다.

---

## 인증·토큰 관리

- [x] `VITE_API_BASE_URL`은 `.env` 파일 관리, `.env`는 `.gitignore`에 포함
- [x] Access/Refresh Token은 `localStorage`에만 저장 (상수 키: `accessToken`, `refreshToken`)
- [x] 401 발생 시 Refresh Token으로 자동 재발급, 재발급 실패 시 토큰 삭제 + 홈 리다이렉트
- [x] `_retry` 플래그로 무한 재발급 루프 방지
- [ ] `PrivateRoute`가 라우팅에 미연결 — `/workspace` 직접 접근 시 인증 미검증 (TD-FE-001)
- [ ] `localStorage` 기반 저장은 XSS 취약점 노출 시 토큰 탈취 가능 — httpOnly Cookie 전환 검토 필요

## XSS 방어

- [x] JSX는 기본적으로 텍스트를 HTML 이스케이프 처리 (React 기본 동작)
- [ ] `dangerouslySetInnerHTML` 사용 금지 확인 필요 (현재 미사용으로 추정)
- [ ] 교안 콘텐츠가 HTML 형식일 경우 sanitize-html 등 라이브러리 도입 필요

## 환경변수 및 시크릿

- [x] `.env` 파일에 시크릿 보관, Git에 커밋 금지
- [ ] `VITE_` 접두사 환경변수는 번들에 노출됨 — API 키 등 시크릿을 `VITE_` 변수로 관리하지 않도록 주의
- [ ] 운영 환경 `.env` 관리 방안 미수립

## 입력 검증

- [x] 회원가입·로그인 폼은 클라이언트 측 기본 유효성 검사 수행
- [ ] 최종 검증은 서버(백엔드)에서 수행 — 클라이언트 검증만으로는 충분하지 않음

## 의존성

- [ ] `npm audit`으로 알려진 취약점 주기적 확인
- [ ] 주요 의존성: React 19, react-router-dom 7, Axios 1.x — 최신 보안 패치 적용 여부 확인

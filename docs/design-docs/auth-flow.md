# 설계 결정 — 인증 흐름

> 상태: ✅ 확정

---

## 결정 사항

### 1. 토큰 저장: `localStorage`

Access Token과 Refresh Token을 `localStorage`에 저장한다.
- 키: `accessToken`, `refreshToken`
- 읽기/쓰기는 `src/api/axios.js`와 콜백/로그인 페이지에서만 수행

**대안 검토**
- `sessionStorage`: 탭 닫으면 로그아웃 → 사용자 경험 저하로 기각
- `httpOnly Cookie`: XSS 방어에 유리하나 백엔드 쿠키 설정 변경 필요 — 현재 스펙상 백엔드가 쿼리 파라미터로 토큰 전달하므로 채택 불가

### 2. 토큰 자동 갱신: Axios 응답 인터셉터

모든 API 응답을 가로채 401 상태 코드 시 Refresh Token으로 재발급을 시도한다.
- `_retry` 플래그로 무한 루프 방지
- 재발급 성공 → localStorage 갱신 + 원래 요청 재시도
- 재발급 실패 → 토큰 삭제 + `ROUTES.home`(`/`)으로 리다이렉트

**대안 검토**
- 컴포넌트 레벨 처리: 각 페이지마다 중복 구현 필요 → 인터셉터로 집중

### 3. 카카오 OAuth2 콜백: `KakaoCallbackPage`

백엔드가 카카오 인증 후 `/oauth2/callback?accessToken=...&refreshToken=...`으로 리다이렉트.
`KakaoCallbackPage`가 URL 쿼리 파라미터에서 토큰을 추출·저장한 뒤 `getMe()`를 호출하여 신규 유저 여부를 판별한다.
- `username` 없음(신규) → `/oauth2/signup` (닉네임 입력)
- `username` 있음(기존) → `/workspace`

---

## 관련 파일

- `src/api/axios.js` — 인터셉터 구현
- `src/api/auth.js` — 인증 API 함수
- `src/KakaoCallbackPage.jsx` — OAuth2 콜백 처리
- `src/KakaoSignUpPage.jsx` — 닉네임 입력
- `src/shared/constants/routes.js` — 리다이렉트 경로 상수

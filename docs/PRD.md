# PRD — EQZ 서비스 기획서 (프론트엔드)

## 1. 서비스 개요

교수(강사)와 학생을 위한 교안 관리 및 퀴즈(문제 은행) 플랫폼 — 프론트엔드.

- **기술 스택**: React 19, Vite 8, react-router-dom v7, Axios
- **백엔드 연동**: JWT Bearer Token (Access + Refresh), Kakao OAuth2 OIDC
- **Base URL**: `VITE_API_BASE_URL` 환경변수

---

## 2. 사용자 유형

| Role | 설명 | 주요 화면 |
|------|------|-----------|
| `PROF` | 강사 (교수) | 교안 작성, 퀴즈 생성, 퀴즈 통계 |
| `USER` | 학생 | 교안 보기, 퀴즈 풀기, 오답 정리 |
| `ADMIN` | 서비스 관리자 | 전체 데이터 관리 |

> Role은 JWT claim에서 결정되며 프론트엔드에서 변경 불가.

---

## 3. 사용자 시나리오

### 강사 (PROF)
1. 이메일/비밀번호 또는 카카오 계정으로 로그인
2. 워크스페이스 접속 → FAB 메뉴에서 '교안 작성' 선택
3. 교안 작성·편집
4. FAB 메뉴에서 '퀴즈 생성' 선택 → 퀴즈 세트 및 문제 생성 (교안 페이지/문단 참조 지정)
5. FAB 메뉴에서 '퀴즈 통계' 선택 → 응시 결과 확인

### 학생 (USER)
1. 이메일/비밀번호 또는 카카오 계정으로 로그인
2. 워크스페이스 접속 → FAB 메뉴에서 '전체 조회' 선택
3. 교안 열람
4. 퀴즈 풀기 → 답안 제출 → 채점 결과 확인
5. 오답 문제별 교수가 지정한 교안 참조(페이지/문단) 확인

---

## 4. 화면 목록

| 화면 | 경로 | 인증 | 설명 |
|------|------|------|------|
| 로그인 | `/` | ❌ | 이메일·비밀번호 로그인, 카카오 로그인 버튼 |
| 회원가입 | `/signup` | ❌ | 닉네임·이메일·비밀번호 입력 |
| 카카오 콜백 | `/oauth2/callback` | ❌ | 백엔드 리다이렉트 처리, 토큰 저장 |
| 카카오 닉네임 입력 | `/oauth2/signup` | ❌ | 카카오 최초 로그인 시 닉네임 설정 |
| 워크스페이스 | `/workspace` | ✅ | 교안·퀴즈·통계 기능의 메인 화면 |

---

## 5. 워크스페이스 뷰 구성

워크스페이스(`/workspace`)는 단일 페이지에서 FAB 메뉴로 뷰를 전환합니다.

| 뷰 | 대상 Role | 구현 상태 |
|----|----------|-----------|
| 교안 작성 (`lesson`) | PROF | ✅ 구현 |
| 퀴즈 생성 (`quiz-create`) | PROF | 🚧 미구현 |
| 퀴즈 통계 (`quiz-stats`) | PROF | 🚧 미구현 |
| 전체 조회 (`overview`) | USER/PROF | ✅ 더미 데이터 기반 구현 |

---

## 6. 인증 흐름

### 일반 로그인
```
① 사용자 → POST /api/auth/login (email, password)
② 서버 → { accessToken, refreshToken }
③ 프론트 → localStorage 저장 → /workspace 리다이렉트
```

### 카카오 로그인
```
① 사용자 → /oauth2/authorization/kakao (백엔드 리다이렉트)
② 카카오 → 백엔드 콜백
③ 백엔드 → /oauth2/callback?accessToken=...&refreshToken=... (프론트 리다이렉트)
④ KakaoCallbackPage → 토큰 저장 → getMe() 호출
   - username 있음 → /workspace
   - username 없음(신규) → /oauth2/signup
⑤ KakaoSignUpPage → 닉네임 설정 → /workspace
```

### 토큰 갱신 (자동)
```
① API 요청 → 401 응답
② 인터셉터 → POST /api/auth/reissue
③ 새 토큰 쌍 localStorage 갱신 → 원래 요청 재시도
④ 재발급 실패 → 토큰 삭제 → / 리다이렉트
```

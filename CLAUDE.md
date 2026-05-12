# CLAUDE.md — EQH FrontEnd

> 이 파일은 목차(map)입니다. 세부 내용은 아래 문서를 참조하세요.
> 이 파일에 없는 결정·규칙은 존재하지 않는 것으로 간주합니다.

## 프로젝트

교수(강사)와 학생을 위한 교안 관리 및 퀴즈(문제 은행) 플랫폼 — 프론트엔드.
- **진입점**: `src/main.jsx`
- **언어**: JavaScript (JSX), React 19, Vite 8

## 빠른 시작

```bash
npm install        # 의존성 설치
npm run dev        # 개발 서버 (포트는 vite.config.js, 기본 5174)
npm run build      # 프로덕션 빌드
npm run lint       # ESLint 검사
```

환경별 URL·호스트는 **소스에 하드코딩하지 않고** `.env`의 `VITE_*`만 사용합니다. 읽기·가공·export는 **`src/config/env.js` 한 곳**에서 하고, 나머지 코드는 여기서 보낸 상수만 import합니다.  
예: API 베이스 **`VITE_API_BASE_URL`**, 프론트 공개 주소(메일 링크·백엔드에 넘기는 origin 등) **`VITE_APP_PUBLIC_URL`**, 카카오 시작 URL은 `VITE_KAKAO_OAUTH_AUTHORIZATION_URL` 또는 API 베이스 + `VITE_OAUTH2_KAKAO_AUTHORIZATION_PATH` 조합(키 목록은 `.env.example` 참고).

## 핵심 불변 규칙

1. 모든 API 호출은 `src/api/axios.js`의 인스턴스(`instance`)를 통해서만 수행 — `axios` 직접 호출 금지
2. 라우트 경로 문자열은 `src/shared/constants/routes.js`의 `ROUTES` 상수만 사용 — 하드코딩 금지
3. Access/Refresh Token은 `localStorage`에만 저장 (`accessToken`, `refreshToken` 키)
4. 401 처리·토큰 재발급은 `src/api/axios.js` 인터셉터에서만 담당 — 컴포넌트·페이지 레벨 중복 처리 금지
5. UI 텍스트(레이블, 메시지, 오류 안내)는 항상 **한국어**
6. API 베이스·프론트 공개 URL·OAuth 등 **환경에 따라 바뀌는 URL/호스트**는 `.env`의 `VITE_*`와 `src/config/env.js` export만 사용 — 컴포넌트·`src/api/*`에 `http(s)://…` 호스트 하드코딩 금지

## 문서 지도

| 문서 | 내용 |
|------|------|
| `docs/ARCHITECTURE.md` | 컴포넌트·페이지 구조, 라우팅, API 레이어 |
| `docs/API-SPEC.md` | 백엔드 REST API 명세 (인증·사용자·교안·퀴즈 요약) |
| `docs/PRD.md` | 서비스 기획, 사용자 시나리오 (프론트엔드 관점) |
| `docs/QUALITY.md` | 화면·레이어별 품질 등급 및 개선 우선순위 |
| `docs/SECURITY.md` | 프론트엔드 보안 체크리스트 |
| `docs/design-docs/index.md` | 설계 결정 목록 (왜 이렇게 만들었는가) |
| `docs/exec-plans/README.md` | **계획 작성 규칙** (새 작업 전 필독) |
| `docs/exec-plans/tech-debt-tracker.md` | 알려진 기술 부채 목록 |
| `docs/exec-plans/active/` | 진행 중인 기능 구현 계획 |
| `docs/exec-plans/completed/` | 완료된 계획 및 의사결정 로그 |
| `docs/generated/component-tree.md` | 컴포넌트 트리 (코드 기반 자동 갱신 대상) |
| `docs/product-specs/index.md` | 제품 스펙 목록 |

## 권한 및 인증

- **Role**: `PROF`(강사) · `USER`(학생) · `ADMIN`(관리자) — 백엔드 JWT claim에서 결정
- **인증**: JWT — Access 30분 / Refresh 7일 (Rotation, 재발급 시 신규 토큰 쌍 수신)
- **소셜**: Kakao OAuth2 (OIDC) — 백엔드 콜백 후 `/oauth2/callback?accessToken=...&refreshToken=...`
- **토큰 저장**: `localStorage` (`accessToken`, `refreshToken`)

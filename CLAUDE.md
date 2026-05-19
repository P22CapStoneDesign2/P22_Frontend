# CLAUDE.md — EQH FrontEnd

> 이 파일은 EQH 프론트엔드 작업을 위한 프로젝트 헌장과 문서 지도입니다.  
> 세부 구현 규칙은 `docs/` 문서를 따릅니다.  
> 이 파일과 이 파일이 명시적으로 참조하는 `docs/` 문서에 없는 결정·규칙은 임의로 새로 만들지 않습니다.

## 프로젝트

교수(강사)와 학생을 위한 교안 관리 및 퀴즈(문제 은행) 플랫폼 — 프론트엔드.

- **진입점**: `src/main.jsx`
- **언어/프레임워크**: JavaScript(JSX), React 19, Vite 8
- **주요 사용자 역할**: `PROF`(강사), `USER`(학생), `ADMIN`(관리자)

## 빠른 시작

```bash
npm install        # 의존성 설치
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run lint       # ESLint 검사
```

## 핵심 원칙

1. 프론트엔드는 백엔드 API 계약을 소비하는 클라이언트입니다.
   - 백엔드에 존재하지 않는 API, 권한, 응답 필드를 임의로 가정하지 않습니다.
   - API 계약 변경이 필요하면 먼저 문서와 실행 계획에 반영하고 사용자 승인을 받습니다.

2. 환경별로 달라지는 값은 코드에 하드코딩하지 않습니다.
   - API base URL, 프론트 공개 URL, OAuth URL 등은 `.env`의 `VITE_*` 값으로 관리합니다.
   - 환경 변수 읽기와 가공은 `src/config/env.js`에서만 수행합니다.

3. 네트워크 API 호출은 중앙화된 API 계층을 통해서만 수행합니다.
   - API 클라이언트 경계는 `src/api/axios.js`입니다.
   - 화면 컴포넌트는 백엔드 호출 세부사항을 직접 알지 않도록 합니다.
   - API 계층의 상세 설계는 `docs/ARCHITECTURE.md`를 따릅니다.

4. 인증과 토큰 갱신은 중앙에서 처리합니다.
   - Access Token과 Refresh Token은 `localStorage`에만 저장합니다.
   - 토큰 키는 `accessToken`, `refreshToken`을 사용합니다.
   - 401 처리, 토큰 재발급, 재시도 정책은 API 클라이언트 계층에서만 담당합니다.
   - 컴포넌트·페이지에서 인증 만료 처리 로직을 중복 구현하지 않습니다.

5. 라우팅 경로는 중앙 상수를 사용합니다.
   - 라우트 경로 문자열은 `src/shared/constants/routes.js`의 `ROUTES`를 기준으로 합니다.
   - 화면 코드에서 라우트 path를 임의 문자열로 반복 작성하지 않습니다.

6. 사용자에게 노출되는 모든 UI 텍스트는 한국어로 작성합니다.
   - 버튼, 라벨, placeholder, toast, modal, empty state, validation message, 오류 안내를 포함합니다.
   - 코드 식별자, 파일명, 함수명은 영어를 사용할 수 있습니다.

7. 프론트엔드 권한 분기는 UX 보조 수단입니다.
   - 최종 권한 검증은 항상 백엔드가 수행한다고 가정합니다.
   - 역할은 백엔드 JWT claim을 기준으로 판단합니다.

8. 보안 관련 흐름은 임의로 변경하지 않습니다.
   - OAuth callback, 토큰 저장, 로그아웃, 인증 만료 처리는 `docs/SECURITY.md`와 `docs/ARCHITECTURE.md`를 따릅니다.
   - query string으로 전달된 토큰은 저장 후 즉시 URL에서 제거해야 합니다.

9. 작업 단계마다 관련 문서를 갱신합니다.
   - API, 라우팅, 인증, 환경 변수, 보안, 사용자 흐름이 바뀌면 관련 `docs/` 문서도 함께 수정합니다.
   - 다음 단계로 넘어가기 전 사용자 승인을 받습니다.

## 아키텍처 경계

### 환경 설정

- 환경 변수 원본: `.env`, `.env.example`
- 환경 변수 export 지점: `src/config/env.js`
- 컴포넌트, 페이지, 훅, API 모듈에서 `import.meta.env`를 직접 읽지 않습니다.
- `http://...`, `https://...` 호스트를 소스 코드에 직접 작성하지 않습니다.

자세한 규칙은 다음 문서를 따릅니다.

- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`

### API 계층

API 호출은 다음 경계를 따릅니다.

```txt
컴포넌트 / 페이지 / 훅
  ↓
도메인 API 모듈
  ↓
src/api/axios.js
  ↓
백엔드 API
```

불변 규칙:

- `axios` 직접 import를 금지합니다.
- `fetch`, `XMLHttpRequest` 직접 사용을 금지합니다.
- 컴포넌트와 페이지는 API endpoint, 인증 헤더, refresh 처리 세부사항을 직접 다루지 않습니다.
- 백엔드 응답 구조와 에러 처리 방식은 `docs/API-SPEC.md`와 `docs/ARCHITECTURE.md`를 따릅니다.

### 인증 / 인가

- 인증 방식: JWT
- Access Token 유효기간: 30분
- Refresh Token 유효기간: 7일
- Refresh Token Rotation 적용
- 소셜 로그인: Kakao OAuth2 / OIDC
- 역할:
  - `PROF`: 강사
  - `USER`: 학생
  - `ADMIN`: 관리자

인증 관련 세부 구현은 다음 문서를 따릅니다.

- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/API-SPEC.md`

### 라우팅

- 라우트 상수 원본: `src/shared/constants/routes.js`
- 새 화면을 추가할 때는 먼저 `ROUTES`에 경로를 정의합니다.
- 인증 필요 라우트, 역할별 접근 제한, 기본 리다이렉트 정책은 `docs/ARCHITECTURE.md`를 따릅니다.

## 문서 운영 규칙

새 작업을 시작하기 전 다음을 확인합니다.

1. `docs/exec-plans/README.md`
2. 관련 `docs/ARCHITECTURE.md`
3. 관련 `docs/API-SPEC.md`
4. 관련 `docs/SECURITY.md`
5. 기존 active/completed exec-plan

다음 변경이 있으면 문서 갱신이 필수입니다.

- API 요청/응답 변경
- 인증/인가 흐름 변경
- 라우트 추가/변경
- 환경 변수 추가/변경
- 보안 정책 변경
- 주요 컴포넌트 구조 변경
- 사용자 시나리오 변경
- 알려진 버그 또는 해결 과정 발생

작업 흐름:

1. 작업 범위를 확인합니다.
2. 필요한 경우 `docs/exec-plans/active/`에 실행 계획을 작성합니다.
3. 관련 설계 문서를 최신화합니다.
4. 사용자 승인을 받은 뒤 구현합니다.
5. 구현 후 문서와 코드가 일치하는지 확인합니다.
6. 완료된 계획은 `docs/exec-plans/completed/`로 이동합니다.

## 품질 기준

작업 완료 전 가능한 경우 아래 명령을 실행합니다.

```bash
npm run lint
npm run build
```

다음은 허용하지 않습니다.

- 문서와 다른 임의 구현
- API 호출 계층 우회
- 인증/토큰 처리 중복 구현
- 환경 URL 하드코딩
- 라우트 문자열 하드코딩
- 사용자 노출 문구의 영문 방치
- 백엔드 API 스펙을 확인하지 않은 추측성 구현
- 보안 관련 흐름의 무단 변경

새 의존성 추가, 아키텍처 변경, 인증 흐름 변경, API 계약 변경은 사용자 승인 없이 진행하지 않습니다.

## 문서 지도

| 문서 | 내용 |
|------|------|
| `docs/ARCHITECTURE.md` | 컴포넌트·페이지 구조, 라우팅, API 계층, 인증 흐름 |
| `docs/API-SPEC.md` | 프론트엔드 관점의 백엔드 REST API 명세 |
| `docs/PRD.md` | 서비스 기획, 사용자 시나리오 |
| `docs/QUALITY.md` | 화면·레이어별 품질 기준 및 개선 우선순위 |
| `docs/SECURITY.md` | 프론트엔드 보안 체크리스트 |
| `docs/design-docs/index.md` | 설계 결정 목록 |
| `docs/exec-plans/README.md` | 실행 계획 작성 규칙 |
| `docs/exec-plans/tech-debt-tracker.md` | 알려진 기술 부채 목록 |
| `docs/exec-plans/active/` | 진행 중인 기능 구현 계획 |
| `docs/exec-plans/completed/` | 완료된 계획 및 의사결정 로그 |
| `docs/generated/component-tree.md` | 컴포넌트 트리, 코드 기반 자동 갱신 대상 |
| `docs/product-specs/index.md` | 제품 스펙 목록 |

## 작업 전 확인 질문

구현 중 아래 중 하나라도 해당하면 즉시 멈추고 문서 또는 사용자 확인을 우선합니다.

- 필요한 API가 문서에 없는가?
- 응답 형식이 불명확한가?
- 권한 기준이 모호한가?
- 새 환경 변수가 필요한가?
- 라우트 추가가 필요한가?
- 인증 또는 OAuth 흐름을 바꿔야 하는가?
- 기존 아키텍처 경계를 우회해야만 구현 가능한가?
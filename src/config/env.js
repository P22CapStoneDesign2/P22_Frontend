/**
 * Vite 환경 변수 중앙 관리 (`VITE_` 접두사 필수).
 * API 베이스·프론트 공개 URL·OAuth 등 환경마다 바뀌는 URL/호스트는 이 모듈에서만 `import.meta.env`를 읽고 export합니다.
 */
const raw = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL =
  typeof raw === 'string' && raw.length > 0 ? raw.replace(/\/$/, '') : ''

/** Spring OAuth2 카카오 로그인 시작 경로 (API 베이스 기준, 선행 / 포함) */
const pathRaw = import.meta.env.VITE_OAUTH2_KAKAO_AUTHORIZATION_PATH
const defaultKakaoPath = '/oauth2/authorization/kakao'
const kakaoAuthPath =
  typeof pathRaw === 'string' && pathRaw.length > 0
    ? pathRaw.startsWith('/')
      ? pathRaw
      : `/${pathRaw}`
    : defaultKakaoPath

/**
 * 카카오 로그인 브라우저 이동용 전체 URL.
 * VITE_KAKAO_OAUTH_AUTHORIZATION_URL 이 있으면 우선(백엔드 팀에서 전체 URL만 줄 때).
 */
const fullKakaoRaw = import.meta.env.VITE_KAKAO_OAUTH_AUTHORIZATION_URL
export const KAKAO_OAUTH_AUTHORIZATION_URL =
  typeof fullKakaoRaw === 'string' && fullKakaoRaw.length > 0
    ? fullKakaoRaw.replace(/\/$/, '')
    : API_BASE_URL
      ? `${API_BASE_URL}${kakaoAuthPath}`
      : ''

/**
 * 브라우저에서 접근하는 프론트 주소(끝 `/` 없음).
 * 비밀번호 재설정 메일 링크 등 백엔드에 넘길 때 사용 — 하드코딩 금지, `.env`에만 둠.
 */
const appPublicRaw = import.meta.env.VITE_APP_PUBLIC_URL
export const APP_PUBLIC_URL =
  typeof appPublicRaw === 'string' && appPublicRaw.length > 0
    ? appPublicRaw.replace(/\/$/, '')
    : ''

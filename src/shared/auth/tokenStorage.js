/**
 * JWT 저장소 (Access / Refresh).
 * 키는 프로젝트 규칙과 동일: localStorage `accessToken`, `refreshToken`.
 * 로그인 UI는 담당 영역 외 — 저장·조회·삭제 유틸만 제공합니다.
 */

const KEY_ACCESS = 'accessToken'
const KEY_REFRESH = 'refreshToken'

export function getAccessToken() {
  try {
    return localStorage.getItem(KEY_ACCESS) ?? ''
  } catch {
    return ''
  }
}

export function getRefreshToken() {
  try {
    return localStorage.getItem(KEY_REFRESH) ?? ''
  } catch {
    return ''
  }
}

/**
 * @param {{ accessToken: string, refreshToken: string }} tokens
 */
export function setTokens({ accessToken, refreshToken }) {
  try {
    localStorage.setItem(KEY_ACCESS, accessToken)
    localStorage.setItem(KEY_REFRESH, refreshToken)
  } catch {
    // 저장 실패 시 무시 (비보안 모드·용량 등)
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(KEY_ACCESS)
    localStorage.removeItem(KEY_REFRESH)
  } catch {
    // ignore
  }
}

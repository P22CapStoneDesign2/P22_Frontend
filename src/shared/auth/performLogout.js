import { logout as logoutApi } from '../../api/auth.js'
import { ROUTES } from '../constants/routes.js'
import { clearStoredUserRole } from './roleUtils.js'
import { clearTokens, getRefreshToken } from './tokenStorage.js'

/**
 * 서버 refresh 폐기(가능 시) 후 로컬 토큰·role 캐시 제거.
 * API 실패해도 클라이언트 세션은 항상 정리합니다.
 */
export async function performLogout() {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) {
      await logoutApi(refreshToken)
    }
  } catch {
    /* ignore — 오프라인·만료 토큰 등 */
  } finally {
    clearTokens()
    clearStoredUserRole()
  }
}

/**
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {string} [to] 로그아웃 후 이동 경로 (기본: 랜딩)
 */
export function logoutAndNavigate(navigate, to = ROUTES.home) {
  return performLogout().then(() => {
    navigate(to, { replace: true })
  })
}

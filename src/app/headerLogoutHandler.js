import { ROUTES } from '../shared/constants/routes.js'

/** Header 로그아웃 연결용 — auth 모듈 수정 없이 클라이언트 세션만 정리 */
export function clearClientSessionForLogout() {
  try {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    sessionStorage.removeItem('eqh_user_role')
  } catch {
    /* ignore */
  }
}

/**
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @returns {() => void}
 */
export function createHeaderLogoutHandler(navigate) {
  return () => {
    clearClientSessionForLogout()
    navigate(ROUTES.home, { replace: true })
  }
}

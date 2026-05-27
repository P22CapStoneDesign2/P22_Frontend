import { getRoleHomePath } from './getRoleHomePath.js'
import { getStoredUserRole, normalizeUserRole } from '../auth/roleUtils.js'
import { ROUTES } from '../constants/routes.js'

/**
 * 소개 화면 「시작하기」 — 로그인 여부에 따른 이동 (인증 API 변경 없음)
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {boolean} isLoggedIn
 */
export function navigateAfterStart(navigate, isLoggedIn) {
  if (!isLoggedIn) {
    navigate(ROUTES.login, { replace: false })
    return
  }
  const role = normalizeUserRole(getStoredUserRole())
  navigate(getRoleHomePath(role), { replace: false })
}

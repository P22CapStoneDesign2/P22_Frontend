import { ROUTES } from '../constants/routes.js'

/**
 * GET /api/users/me 의 role → 로그인 후 이동 경로
 * @param {string | undefined | null} role PROF | USER | ADMIN
 * @returns {string}
 */
export function dashboardRouteForRole(role) {
  const normalized = String(role ?? '').toUpperCase()
  if (normalized === 'PROF' || normalized === 'ADMIN') {
    return ROUTES.professorDashboard
  }
  if (normalized === 'USER') {
    return ROUTES.studentDashboard
  }
  return ROUTES.home
}

import { ROUTES } from '../constants/routes.js'
import { isProfessorRole, isStudentRole, normalizeUserRole } from '../auth/roleUtils.js'

/**
 * @param {string | undefined | null} role
 */
export function getRoleHomePath(role) {
  const r = normalizeUserRole(role)
  if (r === 'ADMIN') return ROUTES.adminSubjectAccess
  if (isProfessorRole(r)) return ROUTES.professorDashboard
  if (isStudentRole(r)) return ROUTES.studentDashboard
  return ROUTES.home
}

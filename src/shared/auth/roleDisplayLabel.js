import { isProfessorRole, isStudentRole, normalizeUserRole } from './roleUtils.js'

/**
 * @param {string | undefined | null} role
 * @returns {string}
 */
export function getRoleDisplayLabel(role) {
  const r = normalizeUserRole(role)
  if (r === 'ADMIN') return '관리자 계정'
  if (isProfessorRole(r)) return '교수 계정'
  if (isStudentRole(r)) return '학생 계정'
  return ''
}

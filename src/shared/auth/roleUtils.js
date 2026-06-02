/** sessionStorage — GET /api/users/me role 캐시 (퀴즈 API 방어·동기 판별용) */
export const USER_ROLE_STORAGE_KEY = 'eqh_user_role'

/**
 * @param {string | undefined | null} role
 * @returns {string} PROF | USER | ADMIN | STUDENT 등 대문자 정규화
 */
export function normalizeUserRole(role) {
  return String(role ?? '').toUpperCase()
}

/**
 * 백엔드 JWT role: USER(학생). UI·레거시 호환: STUDENT
 * @param {string | undefined | null} role
 */
export function isStudentRole(role) {
  const r = normalizeUserRole(role)
  return r === 'USER' || r === 'STUDENT'
}

/**
 * @param {string | undefined | null} role
 */
export function isProfessorRole(role) {
  const r = normalizeUserRole(role)
  return r === 'PROF' || r === 'PROFESSOR'
}

export function getStoredUserRole() {
  try {
    return sessionStorage.getItem(USER_ROLE_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

/**
 * @param {string | undefined | null} role
 */
export function setStoredUserRole(role) {
  try {
    const normalized = normalizeUserRole(role)
    if (normalized) {
      sessionStorage.setItem(USER_ROLE_STORAGE_KEY, normalized)
    } else {
      sessionStorage.removeItem(USER_ROLE_STORAGE_KEY)
    }
  } catch {
    /* ignore */
  }
}

export function clearStoredUserRole() {
  try {
    sessionStorage.removeItem(USER_ROLE_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/** 학생 퀴즈 응시 결과 캐시 — 제출 API 응답 기반 (재방문용) */
export const STUDENT_QUIZ_ATTEMPTS_STORAGE_KEY = 'eqh_student_quiz_attempts'

export function genStudentAttemptId() {
  return `attempt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * @typedef {object} StudentQuizAttemptBundle
 * @property {string} attemptId
 * @property {string} quizId
 * @property {string} [materialId]
 * @property {object[]} questions
 */

/**
 * @returns {StudentQuizAttemptBundle[]}
 */
function loadAllAttempts() {
  try {
    const raw = localStorage.getItem(STUDENT_QUIZ_ATTEMPTS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.attempts)) return []
    return parsed.attempts
  } catch {
    return []
  }
}

/**
 * @param {StudentQuizAttemptBundle} bundle
 */
function persistAttempts(attempts) {
  try {
    localStorage.setItem(STUDENT_QUIZ_ATTEMPTS_STORAGE_KEY, JSON.stringify({ attempts }))
  } catch {
    /* quota */
  }
}

/**
 * @param {StudentQuizAttemptBundle} bundle
 */
export function saveStudentQuizAttempt(bundle) {
  if (!bundle?.attemptId) return
  const quizId = String(bundle.quizId ?? bundle.materialId ?? '').trim()
  const normalized = {
    ...bundle,
    quizId: quizId || String(bundle.quizId ?? ''),
  }
  const attempts = loadAllAttempts().filter((a) => {
    if (a.attemptId === normalized.attemptId) return false
    const existingQuizId = String(a.quizId ?? a.materialId ?? '').trim()
    if (quizId && existingQuizId === quizId) return false
    return true
  })
  persistAttempts([...attempts, normalized])
}

/**
 * @param {string} attemptId
 * @returns {StudentQuizAttemptBundle | null}
 */
export function loadStudentQuizAttempt(attemptId) {
  const id = String(attemptId ?? '').trim()
  if (!id) return null
  return loadAllAttempts().find((a) => a.attemptId === id) ?? null
}

/**
 * quizId 기준 최신 제출 결과 (서버 결과 조회 API 없을 때 재방문용)
 * @param {string|number} quizId
 * @returns {StudentQuizAttemptBundle | null}
 */
export function loadStudentQuizAttemptByQuizId(quizId) {
  const id = String(quizId ?? '').trim()
  if (!id) return null
  const matches = loadAllAttempts().filter(
    (a) => String(a.quizId ?? a.materialId ?? '').trim() === id,
  )
  if (matches.length === 0) return null
  return matches[matches.length - 1]
}

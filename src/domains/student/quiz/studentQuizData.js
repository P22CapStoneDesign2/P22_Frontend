/** 학생 퀴즈 응시 결과 캐시 — 제출 API 응답 기반 (재방문용) */
export const STUDENT_QUIZ_ATTEMPTS_STORAGE_KEY = 'eqh_student_quiz_attempts'

export function genStudentAttemptId() {
  return `attempt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * @returns {Array<{ attemptId: string, materialId: string, questions: object[] }>}
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
 * @param {{ attemptId: string, materialId: string, questions: object[] }} bundle
 */
export function saveStudentQuizAttempt(bundle) {
  if (!bundle?.attemptId) return
  const attempts = loadAllAttempts().filter((a) => a.attemptId !== bundle.attemptId)
  try {
    localStorage.setItem(
      STUDENT_QUIZ_ATTEMPTS_STORAGE_KEY,
      JSON.stringify({ attempts: [...attempts, bundle] }),
    )
  } catch {
    /* quota */
  }
}

/**
 * @param {string} attemptId
 * @returns {{ attemptId: string, materialId: string, questions: object[] } | null}
 */
export function loadStudentQuizAttempt(attemptId) {
  const id = String(attemptId ?? '').trim()
  if (!id) return null
  return loadAllAttempts().find((a) => a.attemptId === id) ?? null
}

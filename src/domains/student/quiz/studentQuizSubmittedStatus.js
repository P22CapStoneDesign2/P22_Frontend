import { loadStudentQuizAttemptByQuizId } from './studentQuizData.js'

/**
 * @param {unknown} item
 */
export function isQuizSubmittedFromApiItem(item) {
  if (!item || typeof item !== 'object') return false
  return Boolean(
    item.submitted === true ||
      item.isSubmitted === true ||
      item.completed === true ||
      item.hasAttempt === true ||
      item.attempted === true ||
      (item.submittedAt != null && String(item.submittedAt).trim() !== ''),
  )
}

/**
 * @param {string|number} quizId
 * @param {unknown} [apiItem]
 */
export function isQuizSubmittedForStudent(quizId, apiItem) {
  if (isQuizSubmittedFromApiItem(apiItem)) return true
  const id = String(quizId ?? '').trim()
  if (!id) return false
  const stored = loadStudentQuizAttemptByQuizId(id)
  return Boolean(stored?.questions?.length)
}

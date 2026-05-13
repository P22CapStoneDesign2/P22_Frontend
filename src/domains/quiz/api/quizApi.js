import { httpClient } from '../../../shared/api/httpClient.js'

/**
 * @param {Record<string, string | number | boolean | undefined | null>} params
 */
function toSearchParams(params) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    sp.set(k, String(v))
  })
  return sp.toString()
}

/**
 * @param {object} payload — 명세: title, description?
 */
export function createQuiz(payload) {
  return httpClient('/api/quiz', { method: 'POST', json: payload })
}

/**
 * @param {Record<string, string | number | undefined | null>} [params] — page, size, sort 등
 */
export function getQuizzes(params = {}) {
  const q = toSearchParams(params)
  const path = q ? `/api/quiz?${q}` : '/api/quiz'
  return httpClient(path, { method: 'GET' })
}

export function getQuizDetail(quizId) {
  return httpClient(`/api/quiz/${encodeURIComponent(String(quizId))}`, { method: 'GET' })
}

/**
 * @param {string|number} quizId
 * @param {object} payload — 명세: title, description?
 */
export function updateQuiz(quizId, payload) {
  return httpClient(`/api/quiz/${encodeURIComponent(String(quizId))}`, {
    method: 'PUT',
    json: payload,
  })
}

export function deleteQuiz(quizId) {
  return httpClient(`/api/quiz/${encodeURIComponent(String(quizId))}`, { method: 'DELETE' })
}

/**
 * @param {string|number} quizId
 * @param {object} payload — 문제 추가 본문 (명세 §20)
 */
export function addQuestion(quizId, payload) {
  return httpClient(`/api/quiz/${encodeURIComponent(String(quizId))}/questions`, {
    method: 'POST',
    json: payload,
  })
}

export function updateQuestion(quizId, questionId, payload) {
  const q = encodeURIComponent(String(quizId))
  const qq = encodeURIComponent(String(questionId))
  return httpClient(`/api/quiz/${q}/questions/${qq}`, { method: 'PUT', json: payload })
}

export function deleteQuestion(quizId, questionId) {
  const q = encodeURIComponent(String(quizId))
  const qq = encodeURIComponent(String(questionId))
  return httpClient(`/api/quiz/${q}/questions/${qq}`, { method: 'DELETE' })
}

/**
 * @param {string|number} quizId
 * @param {{ answers: Array<{ questionId: string|number, studentAnswer: string }> }} payload
 */
export function submitQuiz(quizId, payload) {
  return httpClient(`/api/quiz/${encodeURIComponent(String(quizId))}/submit`, {
    method: 'POST',
    json: payload,
  })
}

/**
 * @param {Record<string, string | number | undefined | null>} [params] — page, size 등
 */
export function getWrongAnswers(params = {}) {
  const q = toSearchParams(params)
  const path = q ? `/api/quiz/wrong-answers?${q}` : '/api/quiz/wrong-answers'
  return httpClient(path, { method: 'GET' })
}

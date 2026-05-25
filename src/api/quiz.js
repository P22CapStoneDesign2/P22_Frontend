/* 퀴즈 API — axios instance 규칙 준수 (허용 명세 endpoint 만) */
import instance from './axios.js'

/**
 * @param {{ page?: number, size?: number, sort?: string, lessonId?: string|number, materialId?: string|number }} [params]
 * 백엔드 query 파라미터명은 materialId (lessonId는 프론트 호환용으로 materialId로 매핑)
 */
export const getQuizzes = (params = {}) => {
  const { lessonId, materialId, ...rest } = params ?? {}
  const query = { ...rest }
  const mid = materialId ?? lessonId
  if (mid != null && String(mid).trim() !== '') {
    query.materialId = mid
  }
  return instance.get('/api/quiz', { params: query })
}

/** @param {string|number} quizId */
export const getQuizDetail = (quizId) =>
  instance.get(`/api/quiz/${encodeURIComponent(String(quizId))}`)

/** @param {string|number} quizId */
export const getQuizForEdit = (quizId) =>
  instance.get(`/api/quiz/${encodeURIComponent(String(quizId))}/edit`)

/**
 * @param {{
 *   title: string,
 *   description?: string,
 *   materialId: string|number,
 *   questions?: Array<{
 *     questionText: string,
 *     questionType: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER',
 *     options?: Array<{ optionText: string, correct?: boolean }>,
 *     correctAnswer: string,
 *     explanation?: string,
 *     score?: number,
 *     anchorId?: number|null,
 *     lessonPage?: number|null,
 *     lessonParagraph?: number|null,
 *   }>,
 * }} body
 */
export const createQuiz = (body) => instance.post('/api/quiz', body)

/**
 * @param {string|number} quizId
 * @param {{ title: string, description?: string }} body
 */
export const updateQuiz = (quizId, body) =>
  instance.put(`/api/quiz/${encodeURIComponent(String(quizId))}`, body)

/** @param {string|number} quizId */
export const deleteQuiz = (quizId) =>
  instance.delete(`/api/quiz/${encodeURIComponent(String(quizId))}`)

/**
 * POST /api/quiz/{quizId}/questions — 문제 추가
 * @param {string|number} quizId
 * @param {object} body
 */
export const addQuizQuestion = (quizId, body) =>
  instance.post(`/api/quiz/${encodeURIComponent(String(quizId))}/questions`, body)

/**
 * PUT /api/quiz/{quizId}/questions/{questionId} — 문제 수정
 * @param {string|number} quizId
 * @param {string|number} questionId
 * @param {object} body
 */
export const updateQuizQuestion = (quizId, questionId, body) =>
  instance.put(
    `/api/quiz/${encodeURIComponent(String(quizId))}/questions/${encodeURIComponent(String(questionId))}`,
    body,
  )

/**
 * DELETE /api/quiz/{quizId}/questions/{questionId}
 * @param {string|number} quizId
 * @param {string|number} questionId
 */
export const deleteQuizQuestion = (quizId, questionId) =>
  instance.delete(
    `/api/quiz/${encodeURIComponent(String(quizId))}/questions/${encodeURIComponent(String(questionId))}`,
  )

/**
 * @param {string|number} quizId
 * @param {{ answers: Array<{ questionId: string|number, studentAnswer: string }> }} body
 */
export const submitQuiz = (quizId, body) =>
  instance.post(`/api/quiz/${encodeURIComponent(String(quizId))}/submit`, body)

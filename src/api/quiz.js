/* 퀴즈 API — axios instance 규칙 준수 (허용 명세 endpoint 만) */
import instance from './axios.js'

/**
 * @param {{ page?: number, size?: number, sort?: string, lessonId?: string|number }} [params]
 */
export const getQuizzes = (params = {}) => instance.get('/api/quiz', { params })

/** @param {string|number} quizId */
export const getQuizDetail = (quizId) =>
  instance.get(`/api/quiz/${encodeURIComponent(String(quizId))}`)

/** @param {string|number} quizId */
export const getQuizForEdit = (quizId) =>
  instance.get(`/api/quiz/${encodeURIComponent(String(quizId))}/edit`)

/**
 * @param {{ title: string, description?: string, lessonId: string|number }} body
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

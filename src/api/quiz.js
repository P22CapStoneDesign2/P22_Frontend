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
 * @param {string|number} quizId
 * @param {{ answers: Array<{ questionId: string|number, studentAnswer: string }> }} body
 */
export const submitQuiz = (quizId, body) =>
  instance.post(`/api/quiz/${encodeURIComponent(String(quizId))}/submit`, body)

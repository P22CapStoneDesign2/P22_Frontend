/**
 * @deprecated import from `src/api/quiz.js` — axios instance 단일 경로
 * 하위 호환 re-export
 */
export {
  getQuizzes,
  getQuizDetail,
  getQuizForEdit,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from '../../../api/quiz.js'

import { apiResponseData } from '../../../api/apiResponse.js'
import {
  getQuizzes as getQuizzesAxios,
  getQuizDetail as getQuizDetailAxios,
  getQuizForEdit as getQuizForEditAxios,
  createQuiz as createQuizAxios,
  updateQuiz as updateQuizAxios,
  deleteQuiz as deleteQuizAxios,
  submitQuiz as submitQuizAxios,
  addQuizQuestion as addQuizQuestionAxios,
  updateQuizQuestion as updateQuizQuestionAxios,
  deleteQuizQuestion as deleteQuizQuestionAxios,
} from '../../../api/quiz.js'

/** @param {Parameters<typeof getQuizzesAxios>[0]} [params] */
export async function fetchQuizzesData(params) {
  const res = await getQuizzesAxios(params)
  return apiResponseData(res)
}

/** @param {string|number} quizId */
export async function fetchQuizDetailData(quizId) {
  const res = await getQuizDetailAxios(quizId)
  return apiResponseData(res)
}

/** @param {string|number} quizId */
export async function fetchQuizForEditData(quizId) {
  const res = await getQuizForEditAxios(quizId)
  return apiResponseData(res)
}

/** @param {Parameters<typeof createQuizAxios>[0]} body */
export async function fetchCreateQuizData(body) {
  const res = await createQuizAxios(body)
  return apiResponseData(res)
}

/** @param {string|number} quizId @param {Parameters<typeof updateQuizAxios>[1]} body */
export async function fetchUpdateQuizData(quizId, body) {
  const res = await updateQuizAxios(quizId, body)
  return apiResponseData(res)
}

/** @param {string|number} quizId */
export async function fetchDeleteQuizData(quizId) {
  const res = await deleteQuizAxios(quizId)
  return apiResponseData(res)
}

/** @param {string|number} quizId @param {Parameters<typeof submitQuizAxios>[1]} body */
export async function fetchSubmitQuizData(quizId, body) {
  const res = await submitQuizAxios(quizId, body)
  return apiResponseData(res)
}

/** @param {string|number} quizId @param {object} body */
export async function fetchAddQuizQuestionData(quizId, body) {
  const res = await addQuizQuestionAxios(quizId, body)
  return apiResponseData(res)
}

/** @param {string|number} quizId @param {string|number} questionId @param {object} body */
export async function fetchUpdateQuizQuestionData(quizId, questionId, body) {
  const res = await updateQuizQuestionAxios(quizId, questionId, body)
  return apiResponseData(res)
}

/** @param {string|number} quizId @param {string|number} questionId */
export async function fetchDeleteQuizQuestionData(quizId, questionId) {
  const res = await deleteQuizQuestionAxios(quizId, questionId)
  return apiResponseData(res)
}

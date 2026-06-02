import { studentQuizResultPath } from '../../../shared/constants/routes.js'
import {
  QUIZ_ALREADY_SUBMITTED_NO_RESULT_MESSAGE,
  getQuizSubmitErrorMessage,
  isQuizAlreadySubmittedError,
} from '../../../api/apiErrorMessage.js'
import { buildQuestionEnrichmentByIdFromSolveQuestions } from '../../quiz/mappers/quizResultMapper.js'
import { mapSubmitResponseToResultBundle } from '../../quiz/mappers/quizResultMapper.js'
import {
  loadStudentQuizAttemptByQuizId,
  saveStudentQuizAttempt,
} from '../quiz/studentQuizData.js'

/**
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {{ attemptId: string, quizId?: string, materialId?: string, questions: object[] }} bundle
 */
export function navigateToQuizResult(navigate, bundle) {
  saveStudentQuizAttempt(bundle)
  navigate(studentQuizResultPath(bundle.attemptId), { state: { resultBundle: bundle } })
}

/**
 * @param {string|number} quizId
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @returns {boolean}
 */
export function tryNavigateToStoredQuizResult(quizId, navigate) {
  const stored = loadStudentQuizAttemptByQuizId(quizId)
  if (!stored || !Array.isArray(stored.questions) || stored.questions.length === 0) {
    return false
  }
      navigateToQuizResult(navigate, {
        ...stored,
        quizId: String(quizId),
      })
  return true
}

/**
 * 제출 API 409 — 캐시 결과로 이동 또는 안내
 * @param {unknown} err
 * @param {string|number} quizId
 * @param {object[]} questions — 풀이 세션 문항 (enrichment용, 재채점 아님)
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @returns {boolean} 결과 화면으로 이동했으면 true
 */
export function handleQuizAlreadySubmittedError(err, quizId, questions, navigate) {
  if (!isQuizAlreadySubmittedError(err)) return false
  if (tryNavigateToStoredQuizResult(quizId, navigate)) {
    return true
  }
  window.alert(QUIZ_ALREADY_SUBMITTED_NO_RESULT_MESSAGE)
  return true
}

/**
 * @param {object} apiData — POST submit 응답 data
 * @param {string} quizId
 * @param {object[]} questions
 */
export function buildResultBundleFromSubmitResponse(apiData, quizId, questions) {
  const enrichment = buildQuestionEnrichmentByIdFromSolveQuestions(questions)
  return mapSubmitResponseToResultBundle(apiData, {
    quizId,
    materialId: '',
    questionEnrichmentById: enrichment,
  })
}

export { getQuizSubmitErrorMessage, isQuizAlreadySubmittedError }

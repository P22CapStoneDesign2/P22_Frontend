import { createNewQuestion } from '../quiz-create/quizCreateUtils.js'
import {
  getMaterialEditBundleFromStorage,
  getMaterialIdForQuizSet,
} from '../../quiz/storage/professorQuizzesStorage.js'

/**
 * 퀴즈 수정 화면 — 교안(materialId) 기준 전체 문항 로드
 *
 * @param {string | undefined} quizSetId URL 파라미터 (교안·문항 조회에만 보조)
 * @param {string | undefined | null} [initialActiveQuestionId]
 * @param {string | undefined | null} [materialId] navigation state 우선
 */
export function getMockQuizEditBundle(quizSetId, initialActiveQuestionId = null, materialId = null) {
  const mid =
    (typeof materialId === 'string' && materialId.trim()) ||
    getMaterialIdForQuizSet(quizSetId) ||
    ''

  const fromStorage = getMaterialEditBundleFromStorage(mid, initialActiveQuestionId)
  if (fromStorage && fromStorage.questions.length > 0) return fromStorage

  const fallback = createNewQuestion()
  return {
    materialId: mid,
    questions: [fallback],
    persistedQuestionIds: [],
    primaryQuizSetId: null,
    initialActiveQuestionId: fallback.id,
  }
}

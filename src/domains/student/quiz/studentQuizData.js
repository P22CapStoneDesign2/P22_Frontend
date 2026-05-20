import { getMaterialEditBundleFromStorage } from '../../quiz/storage/professorQuizzesStorage.js'
import {
  areOptionIdSetsEqual,
  getMcRequiredAnswerCount,
} from '../quiz-solve/multipleChoiceSelectionUtils.js'

/** 학생 퀴즈 응시 결과 — localStorage (API 연동 전) */
export const STUDENT_QUIZ_ATTEMPTS_STORAGE_KEY = 'eqh_student_quiz_attempts'

/**
 * @param {string} materialId
 * @returns {Array<{ id: string, questionNumber: number, content: string, type: 'multipleChoice' | 'shortAnswer', requiredAnswerCount: number, options: Array<{ id: string, text: string }> }>}
 */
export function loadStudentSolveQuestions(materialId) {
  const bundle = getMaterialEditBundleFromStorage(materialId)
  if (!bundle?.questions?.length) return []

  return bundle.questions.map((q, index) => {
    const type = q.type === 'shortAnswer' ? 'shortAnswer' : 'multipleChoice'
    return {
      id: q.id,
      questionNumber: index + 1,
      content: typeof q.content === 'string' && q.content.trim() ? q.content.trim() : '—',
      type,
      requiredAnswerCount:
        type === 'multipleChoice' ? getMcRequiredAnswerCount(q.correctOptionIds) : 0,
      options: (q.options ?? []).map((o) => ({
        id: o.id,
        text: typeof o.text === 'string' ? o.text : '',
      })),
    }
  })
}

function normalizeShortAnswer(text) {
  return String(text ?? '').trim().toLowerCase()
}

/**
 * @param {object} stored
 * @param {string[] | undefined} selectedOptionIds
 */
function isMultipleChoiceCorrect(stored, selectedOptionIds) {
  const correctIds = Array.isArray(stored.correctOptionIds)
    ? stored.correctOptionIds.filter((id) => typeof id === 'string' && id.trim())
    : []
  if (correctIds.length === 0) return false
  return areOptionIdSetsEqual(correctIds, selectedOptionIds)
}

/**
 * @param {object | undefined} answer
 * @returns {string[]}
 */
function readSelectedOptionIds(answer) {
  if (Array.isArray(answer?.selectedOptionIds)) {
    return answer.selectedOptionIds.filter((id) => typeof id === 'string' && id.trim())
  }
  if (typeof answer?.selectedOptionId === 'string' && answer.selectedOptionId.trim()) {
    return [answer.selectedOptionId]
  }
  return []
}

/**
 * @param {object} stored
 * @param {string | null | undefined} userShortAnswer
 */
function isShortAnswerCorrect(stored, userShortAnswer) {
  const expected = normalizeShortAnswer(stored.shortAnswer)
  if (!expected) return false
  return normalizeShortAnswer(userShortAnswer) === expected
}

export function genStudentAttemptId() {
  return `attempt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * @param {string} materialId
 * @param {Record<string, object>} answersByQuestionId
 * @returns {{ attemptId: string, materialId: string, questions: object[] } | null}
 */
export function buildGradedQuizAttempt(materialId, answersByQuestionId) {
  const bundle = getMaterialEditBundleFromStorage(materialId)
  if (!bundle?.questions?.length) return null

  const attemptId = genStudentAttemptId()
  const questions = bundle.questions.map((stored, index) => {
    const answer = answersByQuestionId[stored.id]
    const type = stored.type === 'shortAnswer' ? 'shortAnswer' : 'multipleChoice'
    const content =
      typeof stored.content === 'string' && stored.content.trim() ? stored.content.trim() : '—'
    const explanation = typeof stored.explanation === 'string' ? stored.explanation : ''

    if (type === 'multipleChoice') {
      const correctOptionIds = Array.isArray(stored.correctOptionIds)
        ? [...stored.correctOptionIds]
        : []
      const userSelectedOptionIds = readSelectedOptionIds(answer)
      return {
        id: stored.id,
        questionNumber: index + 1,
        content,
        type: 'multipleChoice',
        options: (stored.options ?? []).map((o) => ({
          id: o.id,
          text: typeof o.text === 'string' ? o.text : '',
        })),
        correctOptionIds,
        correctOptionId: correctOptionIds[0] ?? null,
        correctAnswer: null,
        userSelectedOptionIds,
        userSelectedOptionId: userSelectedOptionIds[0] ?? null,
        userShortAnswer: null,
        isCorrect: isMultipleChoiceCorrect(stored, userSelectedOptionIds),
        explanation,
      }
    }

    const userShortAnswer =
      answer?.shortAnswer != null ? String(answer.shortAnswer).trim() : ''
    const correctAnswer =
      typeof stored.shortAnswer === 'string' ? stored.shortAnswer.trim() : ''

    return {
      id: stored.id,
      questionNumber: index + 1,
      content,
      type: 'shortAnswer',
      options: [],
      correctOptionId: null,
      correctOptionIds: [],
      correctAnswer: correctAnswer || '—',
      userSelectedOptionId: null,
      userShortAnswer: userShortAnswer || null,
      isCorrect: isShortAnswerCorrect(stored, userShortAnswer),
      explanation,
    }
  })

  return { attemptId, materialId: String(materialId), questions }
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

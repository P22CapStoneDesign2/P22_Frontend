import {
  fetchAddQuizQuestionData,
  fetchCreateQuizData,
  fetchDeleteQuizQuestionData,
  fetchUpdateQuizData,
  fetchUpdateQuizQuestionData,
} from './api/quizApi.js'
import { getApiErrorMessage } from '../../api/apiErrorMessage.js'
import {
  buildQuizCreateApiPayload,
  mapEditorQuestionToApiQuestionPayload,
  mapEditorQuestionToApiQuestionUpdatePayload,
  parseLessonIdForApi,
} from './mappers/quizMapper.js'

/**
 * 퀴즈 메타 + 문항 저장 (POST/PUT /api/quiz, §22~23 문제 API)
 *
 * @param {object} params
 * @param {string|null} params.quizId
 * @param {string} params.lessonId
 * @param {string} params.title
 * @param {string} [params.description]
 * @param {object[]} params.questions
 * @param {string[]} [params.initialPersistedQuestionIds]
 * @returns {Promise<string>} 저장된 quizId
 */
export async function persistQuizWithQuestions({
  quizId,
  lessonId,
  title,
  description = '',
  questions,
  initialPersistedQuestionIds = [],
}) {
  const lessonIdNum = parseLessonIdForApi(lessonId)
  if (lessonIdNum == null) {
    throw new Error('LESSON_ID_REQUIRED')
  }

  let effectiveQuizId = quizId != null ? String(quizId).trim() : ''
  if (!effectiveQuizId) {
    const payload = buildQuizCreateApiPayload({
      lessonId: lessonIdNum,
      title,
      description,
      questions,
    })
    try {
      const created = await fetchCreateQuizData(payload)
      if (created?.id == null) {
        throw new Error('퀴즈 생성에 실패했습니다.')
      }
      effectiveQuizId = String(created.id)
      return effectiveQuizId
    } catch (err) {
      const message = getApiErrorMessage(err, '퀴즈 생성에 실패했습니다.')
      console.error('QUIZ CREATE FAILED', message, err?.response?.data)
      throw new Error(message)
    }
  }

  await fetchUpdateQuizData(effectiveQuizId, { title, description })

  const questionOverrides = {}
  const currentIds = new Set(
    questions
      .map((q) => (q?.id == null ? '' : String(q.id).trim()))
      .filter(Boolean),
  )
  const initialSet = new Set(
    (initialPersistedQuestionIds ?? [])
      .map((id) => (id == null ? '' : String(id).trim()))
      .filter(Boolean),
  )

  for (const q of questions) {
    const score = typeof q.score === 'number' ? q.score : 10
    const questionId = q?.id == null ? '' : String(q.id).trim()
    if (questionId && initialSet.has(questionId)) {
      await fetchUpdateQuizQuestionData(
        effectiveQuizId,
        questionId,
        mapEditorQuestionToApiQuestionUpdatePayload(q, { ...questionOverrides, score }),
      )
    } else {
      await fetchAddQuizQuestionData(
        effectiveQuizId,
        mapEditorQuestionToApiQuestionPayload(q, { ...questionOverrides, score }),
      )
    }
  }

  for (const removedId of initialSet) {
    if (!currentIds.has(removedId)) {
      await fetchDeleteQuizQuestionData(effectiveQuizId, removedId)
    }
  }

  return effectiveQuizId
}

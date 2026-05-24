import {
  fetchAddQuizQuestionData,
  fetchCreateQuizData,
  fetchDeleteQuizQuestionData,
  fetchUpdateQuizData,
  fetchUpdateQuizQuestionData,
} from './api/quizApi.js'
import {
  isPersistedQuestionId,
  mapEditorQuestionToApiQuestionPayload,
  mapEditorQuestionToApiQuestionUpdatePayload,
} from './mappers/quizMapper.js'

/**
 * @param {string|number} lessonId
 */
function anchorOverridesForLesson(lessonId) {
  const s = String(lessonId ?? '').trim()
  if (!s) return {}
  const n = Number(s)
  if (Number.isFinite(n)) return { anchorId: n }
  return {}
}

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
  const lessonIdStr = String(lessonId ?? '').trim()
  if (!lessonIdStr) {
    throw new Error('교안(lesson) ID가 없습니다.')
  }

  let effectiveQuizId = quizId != null ? String(quizId).trim() : ''
  if (!effectiveQuizId) {
    const created = await fetchCreateQuizData({
      lessonId: lessonIdStr,
      title,
      description,
    })
    if (created?.id == null) {
      throw new Error('퀴즈 생성에 실패했습니다.')
    }
    effectiveQuizId = String(created.id)
  } else {
    await fetchUpdateQuizData(effectiveQuizId, { title, description })
  }

  const overrides = anchorOverridesForLesson(lessonIdStr)
  const currentIds = new Set(questions.map((q) => q.id).filter(Boolean))
  const initialSet = new Set(
    (initialPersistedQuestionIds ?? []).filter((id) => isPersistedQuestionId(id)),
  )

  for (const q of questions) {
    const score = typeof q.score === 'number' ? q.score : 10
    if (isPersistedQuestionId(q.id) && initialSet.has(q.id)) {
      await fetchUpdateQuizQuestionData(
        effectiveQuizId,
        q.id,
        mapEditorQuestionToApiQuestionUpdatePayload(q, { ...overrides, score }),
      )
    } else {
      await fetchAddQuizQuestionData(
        effectiveQuizId,
        mapEditorQuestionToApiQuestionPayload(q, { ...overrides, score }),
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

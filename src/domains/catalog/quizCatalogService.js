import {
  fetchDeleteQuizData,
  fetchQuizDetailData,
  fetchQuizForEditData,
  fetchQuizzesData,
  fetchSubmitQuizData,
} from '../quiz/api/quizApi.js'
import { mapQuizEditToEditorBundle } from '../quiz/mappers/quizDetailMapper.js'
import { mapQuizListPageDataToTableRows } from '../quiz/mappers/quizManagementMapper.js'
import { mapQuizDetailToSolveQuestions } from '../student/quiz/studentQuizSolveMapper.js'

const LIST_PAGE = { page: 0, size: 100 }

/**
 * @param {unknown} pageData
 * @returns {unknown[]}
 */
function pageContent(pageData) {
  if (!pageData || typeof pageData !== 'object') return []
  if (Array.isArray(pageData.content)) return pageData.content
  if (Array.isArray(pageData)) return pageData
  return []
}

/**
 * @param {string|number} lessonId
 * @returns {Promise<Array<{ value: string, label: string }>>}
 */
export async function fetchQuizOptionsForLesson(lessonId) {
  const id = String(lessonId ?? '').trim()
  if (!id) return []
  try {
    const pageData = await fetchQuizzesData({ ...LIST_PAGE, lessonId: id })
    return pageContent(pageData).map((item) => {
      const quizId = item?.id
      if (quizId == null) return null
      const title = String(item.title ?? '퀴즈').trim() || '퀴즈'
      return { value: String(quizId), label: title }
    }).filter(Boolean)
  } catch {
    return []
  }
}

/**
 * @param {string|number} lessonId
 */
export async function fetchQuizTableRowsForLesson(lessonId) {
  const id = String(lessonId ?? '').trim()
  if (!id) return []
  try {
    const pageData = await fetchQuizzesData({ ...LIST_PAGE, lessonId: id })
    const rows = mapQuizListPageDataToTableRows(pageData)
    return rows.map((row) => ({
      ...row,
      quizSetId: row.id,
      questionId: row.id,
      rowNumber: row.quizNumber,
    }))
  } catch {
    return []
  }
}

/**
 * @param {string|number} quizId — URL path param (`:materialId` 슬롯에 quizId 전달)
 */
export async function fetchStudentSolveSessionByQuizId(quizId) {
  const id = String(quizId ?? '').trim()
  if (!id) return null
  try {
    const detail = await fetchQuizDetailData(id)
    const questions = mapQuizDetailToSolveQuestions(detail)
    if (questions.length === 0) return null
    const lessonId = detail?.lessonId != null ? String(detail.lessonId) : ''
    return { quizId: id, questions, lessonId }
  } catch {
    return null
  }
}

/**
 * @param {string|number} quizId
 */
export async function fetchProfessorQuizEditBundle(quizId, routeQuizId, focusQuestionId) {
  const id = String(quizId ?? '').trim()
  if (!id) return null
  try {
    const data = await fetchQuizForEditData(id)
    const bundle = mapQuizEditToEditorBundle(data, routeQuizId)
    let initialActiveQuestionId = bundle.initialActiveQuestionId
    if (focusQuestionId) {
      const hit = bundle.questions.find((q) => q.id === String(focusQuestionId))
      if (hit) initialActiveQuestionId = hit.id
    }
    return {
      lessonId: bundle.materialId,
      questions: bundle.questions,
      persistedQuestionIds: bundle.questions.map((q) => q.id),
      primaryQuizSetId: bundle.editorQuizId || id,
      initialActiveQuestionId,
    }
  } catch {
    return null
  }
}

/**
 * @param {Array<{ quizSetId: string, questionId: string }>} items
 */
export async function deleteQuizSetsForSelection(items) {
  const ids = [
    ...new Set(items.map((i) => String(i.quizSetId ?? i.questionId ?? '').trim()).filter(Boolean)),
  ]
  for (const qid of ids) {
    await fetchDeleteQuizData(qid)
  }
}

export { fetchSubmitQuizData }

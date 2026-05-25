import {
  fetchDeleteQuizData,
  fetchQuizDetailData,
  fetchQuizForEditData,
  fetchQuizzesData,
  fetchSubmitQuizData,
} from '../quiz/api/quizApi.js'
import { extractQuizQuestionsFromApiData, mapQuizEditToEditorBundle } from '../quiz/mappers/quizDetailMapper.js'
import {
  countQuestionRows,
  flattenQuizListToQuestionRows,
  mapQuizListPageDataToTableRows,
} from '../quiz/mappers/quizManagementMapper.js'
import { mapQuizDetailToSolveQuestions } from '../student/quiz/studentQuizSolveMapper.js'
import { fetchDeleteQuizQuestionData } from '../quiz/api/quizApi.js'

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
 * GET /api/quiz?lessonId= 후 각 퀴즈 GET /api/quiz/{id} 로 questions flatten
 * @param {string|number} lessonId
 */
export async function fetchQuizTableRowsForLesson(lessonId) {
  const id = String(lessonId ?? '').trim()
  if (!id) return []
  try {
    const pageData = await fetchQuizzesData({ ...LIST_PAGE, lessonId: id })
    const summaries = pageContent(pageData)
    if (summaries.length === 0) return []

    /** @type {Record<string, object>} */
    const quizDetailById = {}

    summaries.forEach((summary) => {
      if (!summary || summary.id == null) return
      const quizId = String(summary.id)
      if (extractQuizQuestionsFromApiData(summary).length > 0) {
        quizDetailById[quizId] = summary
      }
    })

    const needDetailFetch = summaries.filter((summary) => {
      if (!summary || summary.id == null) return false
      const quizId = String(summary.id)
      const embedded = quizDetailById[quizId] ?? summary
      return extractQuizQuestionsFromApiData(embedded).length === 0
    })

    const detailEntries = await Promise.all(
      needDetailFetch.map(async (summary) => {
        const quizId = String(summary.id)
        try {
          const detail = await fetchQuizDetailData(quizId)
          return [quizId, detail]
        } catch {
          return [quizId, null]
        }
      }),
    )

    detailEntries.forEach((entry) => {
      if (!entry) return
      const [quizId, detail] = entry
      if (detail && typeof detail === 'object') quizDetailById[quizId] = detail
    })

    const flattened = flattenQuizListToQuestionRows(summaries, quizDetailById)
    if (flattened.length > 0) return flattened

    return mapQuizListPageDataToTableRows(pageData)
  } catch {
    return []
  }
}

/**
 * 교안(lesson)에 속한 전체 문항 수 — 퀴즈 생성 화면 시작 번호용
 * @param {string|number} lessonId
 * @returns {Promise<number>}
 */
export async function fetchLessonQuestionCountForLesson(lessonId) {
  const rows = await fetchQuizTableRowsForLesson(lessonId)
  return countQuestionRows(rows)
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

/**
 * 문항 단위 선택 삭제 — DELETE /api/quiz/{quizId}/questions/{questionId}
 * @param {Array<{ quizSetId: string, questionId: string }>} items
 */
export async function deleteQuizQuestionsForSelection(items) {
  const seen = new Set()
  for (const item of items) {
    const quizId = String(item.quizSetId ?? '').trim()
    const questionId = String(item.questionId ?? '').trim()
    const key = `${quizId}:${questionId}`
    if (!quizId || !questionId || seen.has(key)) continue
    if (questionId === quizId) {
      await fetchDeleteQuizData(quizId)
      seen.add(key)
      continue
    }
    seen.add(key)
    await fetchDeleteQuizQuestionData(quizId, questionId)
  }
}

export { fetchSubmitQuizData }

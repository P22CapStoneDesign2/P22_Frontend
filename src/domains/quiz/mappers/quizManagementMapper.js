/**
 * 교수 퀴즈 관리 — API DTO → 피그마 테이블 행 ViewModel (문항 단위)
 */

import { extractQuizQuestionsFromApiData } from './quizDetailMapper.js'

/**
 * @typedef {object} QuizManagementQuestionRow
 * @property {string} id — 테이블 row key (`quizId-questionId`)
 * @property {number} rowNumber — 교안 전체 기준 표시 번호 (1-based)
 * @property {string} quizSetId
 * @property {string} questionId
 * @property {string} question
 * @property {'multiple' | 'shortAnswer'} questionType
 * @property {string} updatedAt
 */

/**
 * @param {string | undefined} apiType
 * @returns {'multiple' | 'shortAnswer'}
 */
function mapApiQuestionTypeToTableType(apiType) {
  if (apiType === 'SHORT_ANSWER') return 'shortAnswer'
  return 'multiple'
}

/**
 * @param {unknown} a
 * @param {unknown} b
 */
function compareQuizSummariesByCreatedAtAsc(a, b) {
  const ta = new Date(a?.createdAt ?? 0).getTime()
  const tb = new Date(b?.createdAt ?? 0).getTime()
  if (ta !== tb) return ta - tb
  return String(a?.id ?? '').localeCompare(String(b?.id ?? ''), undefined, { numeric: true })
}

/**
 * GET /api/quiz 목록 + 각 퀴즈 상세의 questions → 문항 단위 테이블 행(flatten)
 *
 * @param {unknown[]} quizSummaries — 페이지 content 항목
 * @param {Record<string, object>} quizDetailById — quizId → GET /api/quiz/{id} data
 * @returns {QuizManagementQuestionRow[]}
 */
export function flattenQuizListToQuestionRows(quizSummaries, quizDetailById) {
  if (!Array.isArray(quizSummaries)) return []

  const sorted = [...quizSummaries].filter((s) => s && s.id != null).sort(compareQuizSummariesByCreatedAtAsc)

  /** @type {QuizManagementQuestionRow[]} */
  const rows = []
  let rowNumber = 0

  for (const summary of sorted) {
    const quizId = String(summary.id)
    const detail = quizDetailById[quizId] ?? summary
    const questions = extractQuizQuestionsFromApiData(detail)
    const quizUpdatedAt = detail?.updatedAt ?? summary?.updatedAt ?? summary?.createdAt ?? ''

    if (questions.length === 0) {
      const count = typeof summary.questionCount === 'number' ? summary.questionCount : 0
      if (count <= 0) continue
      rowNumber += 1
      const title = String(summary.title ?? summary.description ?? '—').trim() || '—'
      rows.push({
        id: `${quizId}-meta`,
        rowNumber,
        quizSetId: quizId,
        questionId: quizId,
        question: title,
        questionType: 'multiple',
        updatedAt: String(quizUpdatedAt),
      })
      continue
    }

    questions.forEach((q, qIndex) => {
      if (!q || typeof q !== 'object') return
      const qid = q.id != null ? String(q.id) : `${quizId}-idx-${qIndex}`
      rowNumber += 1
      rows.push({
        id: `${quizId}-${qid}`,
        rowNumber,
        quizSetId: quizId,
        questionId: qid,
        question: String(q.questionText ?? q.content ?? '—').trim() || '—',
        questionType: mapApiQuestionTypeToTableType(q.questionType),
        updatedAt: String(q.updatedAt ?? quizUpdatedAt),
      })
    })
  }

  return rows
}

/**
 * @param {QuizManagementQuestionRow[]} rows
 * @returns {number}
 */
export function countQuestionRows(rows) {
  return Array.isArray(rows) ? rows.length : 0
}

/**
 * GET /api/quiz 페이지 응답 → 문항 단위 테이블 행
 * (목록 항목에 questions가 포함된 경우 즉시 flatten, 없으면 summary만으로 처리)
 *
 * @param {object|null|undefined} pageData — Spring Page `data`
 * @returns {QuizManagementQuestionRow[]}
 */
export function mapQuizListPageDataToTableRows(pageData) {
  const content = Array.isArray(pageData?.content) ? pageData.content : []
  if (content.length === 0) return []

  /** @type {Record<string, object>} */
  const quizDetailById = {}
  content.forEach((item) => {
    if (!item || item.id == null) return
    const quizId = String(item.id)
    if (extractQuizQuestionsFromApiData(item).length > 0) {
      quizDetailById[quizId] = item
    }
  })

  return flattenQuizListToQuestionRows(content, quizDetailById)
}

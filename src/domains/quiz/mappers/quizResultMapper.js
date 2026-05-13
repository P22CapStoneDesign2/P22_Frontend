/**
 * 풀이 세션 문항 배열 → `mapSubmitResponseToResultBundle`용 `questionEnrichmentById`
 *
 * @param {Array<{ id: string|number, type?: string, options?: Array<{ id?: string|number, text?: string }> }>|null|undefined} questions
 * @returns {Record<string, { type: 'multipleChoice'|'shortAnswer', options: Array<{ id: string, text: string }> }>|null}
 */
export function buildQuestionEnrichmentByIdFromSolveQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) return null

  /** @type {Record<string, { type: 'multipleChoice'|'shortAnswer', options: Array<{ id: string, text: string }> }>} */
  const byId = {}

  for (const q of questions) {
    if (q == null || q.id == null) continue
    const id = String(q.id)
    const type = q.type === 'multipleChoice' ? 'multipleChoice' : 'shortAnswer'
    const options = Array.isArray(q.options)
      ? q.options.map((o) => ({
          id: String(o?.id ?? ''),
          text: o?.text != null ? String(o.text) : '',
        }))
      : []
    byId[id] = { type, options }
  }

  return Object.keys(byId).length > 0 ? byId : null
}

/**
 * 퀴즈 제출 API 응답(data) → `QuizResultContent` / mock과 동일한 `questions[]` 형태
 *
 * 제출 응답 `answers[]`에는 객관식 `options`가 없습니다. `questionEnrichmentById`에 풀이 세션 보기를 넘기면
 * `MultipleChoiceResult` 정오답 표시가 가능합니다.
 * 복수 정답(쉼표 연결)인 경우 첫 정답 보기만 `correctOptionId`에 반영됩니다. TODO: UI에서 복수 정답 전체 표시
 *
 * @param {object} apiData — 명세 §23 `data` 객체
 * @param {object} [options]
 * @param {string} [options.materialId] — 교안 PDF 등에 사용 (제출 응답에 없으면 빈 문자열)
 * @param {string} [options.attemptId] — 없으면 `submissionId` 문자열 사용
 * @param {Record<string, { type?: 'multipleChoice'|'shortAnswer', options?: Array<{ id: string, text: string }> }>} [options.questionEnrichmentById]
 */

/**
 * @param {object} row
 * @param {string|number} row.questionId
 * @param {string} row.questionText
 * @param {string} row.studentAnswer
 * @param {string} row.correctAnswer
 * @param {boolean} row.correct
 * @param {number} [row.score]
 */
function mapAnswerRowToResultQuestion(row, questionNumber, questionEnrichmentById) {
  const id = String(row.questionId ?? '')
  const enrichment = questionEnrichmentById?.[id] ?? questionEnrichmentById?.[row.questionId] ?? null

  const options = Array.isArray(enrichment?.options) ? enrichment.options : []
  const wantsMc = enrichment?.type === 'multipleChoice' && options.length > 0
  const resolvedType = wantsMc ? 'multipleChoice' : 'shortAnswer'

  const studentAnswer = row.studentAnswer != null ? String(row.studentAnswer) : ''
  const correctAnswer = row.correctAnswer != null ? String(row.correctAnswer) : ''

  let correctOptionId = null
  let userSelectedOptionId = null

  if (resolvedType === 'multipleChoice' && options.length > 0) {
    const correctParts = correctAnswer
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const matchByText = (text) => options.find((o) => (o.text ?? '').trim() === text)

    if (correctParts.length > 0) {
      const first = matchByText(correctParts[0])
      correctOptionId = first?.id ?? null
    }

    const userOpt = matchByText(studentAnswer.trim())
    userSelectedOptionId = userOpt?.id ?? null
  }

  return {
    id,
    questionNumber,
    content: row.questionText ?? '',
    type: resolvedType,
    options,
    correctOptionId,
    correctAnswer: resolvedType === 'shortAnswer' ? correctAnswer : null,
    userSelectedOptionId,
    userShortAnswer: resolvedType === 'shortAnswer' ? studentAnswer : null,
    isCorrect: Boolean(row.correct),
    explanation: row.explanation != null && String(row.explanation).trim() !== '' ? String(row.explanation) : '',
  }
}

export function mapSubmitResponseToResultBundle(apiData, options = {}) {
  const materialId = options.materialId != null ? String(options.materialId) : ''
  const attemptId =
    options.attemptId != null && String(options.attemptId) !== ''
      ? String(options.attemptId)
      : String(apiData.submissionId ?? '')

  const enrichment = options.questionEnrichmentById ?? null
  const rows = Array.isArray(apiData.answers) ? apiData.answers : []

  const questions = rows.map((row, index) =>
    mapAnswerRowToResultQuestion(row, index + 1, enrichment),
  )

  return {
    attemptId,
    materialId,
    questions,
  }
}

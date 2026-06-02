import { getMcRequiredAnswerCount } from '../quiz-solve/multipleChoiceSelectionUtils.js'

const API_MC = 'MULTIPLE_CHOICE'

/**
 * @typedef {{
 *   id: string,
 *   questionNumber: number,
 *   content: string,
 *   type: 'multipleChoice' | 'shortAnswer',
 *   requiredAnswerCount: number,
 *   options: Array<{ id: string, text: string }>,
 * }} SolveQuestion
 */

/**
 * @param {object} q
 * @param {number} index
 * @returns {SolveQuestion}
 */
function mapApiQuestionToSolve(q, index) {
  const qt = q?.questionType
  const type = qt === API_MC ? 'multipleChoice' : 'shortAnswer'
  const options = Array.isArray(q?.options)
    ? q.options.map((o) => ({
        id: String(o?.id ?? ''),
        text: o?.optionText != null ? String(o.optionText) : '',
      }))
    : []

  const correctIds = []
  if (Array.isArray(q?.options)) {
    for (const o of q.options) {
      if (o?.correct === true && o?.id != null) correctIds.push(String(o.id))
    }
  }

  return {
    id: String(q?.id ?? ''),
    questionNumber: index + 1,
    content:
      typeof q?.questionText === 'string' && q.questionText.trim()
        ? q.questionText.trim()
        : '—',
    type,
    requiredAnswerCount:
      type === 'multipleChoice' ? getMcRequiredAnswerCount(correctIds) : 0,
    options,
  }
}

/**
 * GET /api/quiz/{id} `data` → 풀이 문항 (정답 필드는 학생 상세에 없을 수 있음)
 * @param {object|null|undefined} apiData
 * @returns {SolveQuestion[]}
 */
export function mapQuizDetailToSolveQuestions(apiData) {
  const raw = Array.isArray(apiData?.questions) ? apiData.questions : []
  return raw.map(mapApiQuestionToSolve)
}

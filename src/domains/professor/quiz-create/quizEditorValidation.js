/**
 * 퀴즈 편집기 저장 전 정답 검증
 * @param {Array<{ type?: string, correctOptionIds?: string[], shortAnswer?: string, options?: Array<{ id?: string, correct?: boolean }> }>} questions
 * @param {number} [displayNumberOffset] 화면 표시 번호 오프셋
 * @returns {number[]} 정답 누락 문항 번호(1-based)
 */
export function getQuestionNumbersMissingAnswers(questions, displayNumberOffset = 0) {
  if (!Array.isArray(questions) || questions.length === 0) return []

  const missing = []

  questions.forEach((q, index) => {
    const num = displayNumberOffset + index + 1
    const type = q?.type === 'shortAnswer' ? 'shortAnswer' : 'multipleChoice'

    if (type === 'shortAnswer') {
      const raw = q?.shortAnswer ?? q?.correctAnswer ?? ''
      const text = typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim()
      if (!text) missing.push(num)
      return
    }

    const fromIds = Array.isArray(q.correctOptionIds)
      ? q.correctOptionIds.filter((id) => typeof id === 'string' && id.trim())
      : []

    if (fromIds.length > 0) return

    const opts = Array.isArray(q.options) ? q.options : []
    const fromCorrectFlag = opts.some((o) => o?.correct === true || o?.isCorrect === true)
    if (fromCorrectFlag) return

    missing.push(num)
  })

  return missing
}

/**
 * @param {number[]} missingNumbers
 * @returns {string}
 */
export function formatMissingAnswersAlert(missingNumbers) {
  if (!Array.isArray(missingNumbers) || missingNumbers.length === 0) return ''

  if (missingNumbers.length === 1) {
    return `${missingNumbers[0]}번 문제의 정답이 없습니다.\n\n정답을 입력한 후 저장해주세요.`
  }

  const list = missingNumbers.join(', ')
  return `${list}번 문제의 정답이 없습니다.\n\n정답을 입력한 후 저장해주세요.`
}

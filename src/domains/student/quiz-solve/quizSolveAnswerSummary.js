/**
 * @param {object | undefined} answer
 * @returns {string[]}
 */
function readMcSelectedIds(answer) {
  if (Array.isArray(answer?.selectedOptionIds)) {
    return answer.selectedOptionIds.filter((id) => typeof id === 'string' && id)
  }
  if (typeof answer?.selectedOptionId === 'string' && answer.selectedOptionId) {
    return [answer.selectedOptionId]
  }
  return []
}

/** 왼쪽 네비에 표시할 답 요약 (미응답 / 객관식 보기 / 단답 일부) */
export function getAnswerSummaryLabel(question, answer) {
  if (!answer) return '미응답'

  if (question.type === 'multipleChoice') {
    const ids = readMcSelectedIds(answer)
    if (ids.length === 0) return '미응답'
    if (ids.length === 1) {
      const opt = question.options?.find((o) => o.id === ids[0])
      if (!opt) return '선택됨'
      const t = opt.text
      return t.length > 28 ? `${t.slice(0, 28)}…` : t
    }
    return `${ids.length}개 선택`
  }

  if (question.type === 'shortAnswer') {
    const t = answer.shortAnswer != null ? String(answer.shortAnswer).trim() : ''
    if (!t) return '미응답'
    return t.length > 24 ? `${t.slice(0, 24)}…` : t
  }

  return '미응답'
}

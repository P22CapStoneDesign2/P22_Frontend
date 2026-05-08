/** 왼쪽 네비에 표시할 답 요약 (미응답 / 객관식 보기 / 단답 일부) */
export function getAnswerSummaryLabel(question, answer) {
  if (!answer) return '미응답'

  if (question.type === 'multipleChoice') {
    if (!answer.selectedOptionId) return '미응답'
    const opt = question.options?.find((o) => o.id === answer.selectedOptionId)
    if (!opt) return '선택됨'
    const t = opt.text
    return t.length > 28 ? `${t.slice(0, 28)}…` : t
  }

  if (question.type === 'shortAnswer') {
    const t = answer.shortAnswer != null ? String(answer.shortAnswer).trim() : ''
    if (!t) return '미응답'
    return t.length > 24 ? `${t.slice(0, 24)}…` : t
  }

  return '미응답'
}

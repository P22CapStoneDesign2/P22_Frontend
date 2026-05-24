/**
 * 학생 풀이 화면 상태 → 퀴즈 제출 API 본문 (`POST /api/quiz/{quizId}/submit`, 명세 §23)
 *
 * @param {Array<object>} questions — 풀이 중 로드된 문항 (id, type, options[])
 * @param {Record<string, object>} answersByQuestionId
 * @returns {{ answers: Array<{ questionId: string|number, studentAnswer: string }> }}
 */
function readMcSelectedIds(answer) {
  if (Array.isArray(answer?.selectedOptionIds)) {
    return answer.selectedOptionIds.filter((id) => typeof id === 'string' && id.trim())
  }
  if (typeof answer?.selectedOptionId === 'string' && answer.selectedOptionId.trim()) {
    return [answer.selectedOptionId]
  }
  return []
}

export function mapSolveStateToSubmitRequest(questions, answersByQuestionId) {
  const answers = questions.map((q) => {
    const a = answersByQuestionId[q.id]
    if (q.type === 'multipleChoice') {
      const opts = q.options ?? []
      const selIds = readMcSelectedIds(a)
      const texts = selIds
        .map((selId) => opts.find((o) => o.id === selId))
        .filter(Boolean)
        .map((o) => String(o.text ?? '').trim())
        .filter(Boolean)
      return {
        questionId: q.id,
        studentAnswer: texts.join(', '),
      }
    }
    const raw = a?.shortAnswer != null ? String(a.shortAnswer).trim() : ''
    return {
      questionId: q.id,
      studentAnswer: raw,
    }
  })

  return { answers }
}

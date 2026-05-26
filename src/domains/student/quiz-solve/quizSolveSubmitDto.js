/**
 * @param {object | undefined} answer
 * @returns {string[]}
 */
function readMcSelectedIds(answer) {
  if (Array.isArray(answer?.selectedOptionIds)) {
    return [...answer.selectedOptionIds]
  }
  if (typeof answer?.selectedOptionId === 'string' && answer.selectedOptionId) {
    return [answer.selectedOptionId]
  }
  return []
}

/**
 * 제출 DTO 생성 (콘솔 출력·추후 API용)
 * @param {string} quizId
 * @param {Array<object>} questions
 * @param {Record<string, object>} answersByQuestionId
 */
export function buildQuizSubmitDto(quizId, questions, answersByQuestionId) {
  return {
    quizId,
    answers: questions.map((q) => {
      const a = answersByQuestionId[q.id]
      if (q.type === 'multipleChoice') {
        return {
          questionId: q.id,
          type: 'multipleChoice',
          selectedOptionIds: readMcSelectedIds(a),
          shortAnswer: null,
        }
      }
      const text = a?.shortAnswer != null ? String(a.shortAnswer).trim() : ''
      return {
        questionId: q.id,
        type: 'shortAnswer',
        selectedOptionIds: [],
        shortAnswer: text.length > 0 ? text : null,
      }
    }),
  }
}

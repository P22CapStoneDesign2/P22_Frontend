/**
 * 제출 DTO 생성 (콘솔 출력·추후 API용)
 * @param {string} materialId
 * @param {Array<object>} questions
 * @param {Record<string, object>} answersByQuestionId
 */
export function buildQuizSubmitDto(materialId, questions, answersByQuestionId) {
  return {
    materialId,
    answers: questions.map((q) => {
      const a = answersByQuestionId[q.id]
      if (q.type === 'multipleChoice') {
        return {
          questionId: q.id,
          type: 'multipleChoice',
          selectedOptionId: a?.selectedOptionId ?? null,
          shortAnswer: null,
        }
      }
      const text = a?.shortAnswer != null ? String(a.shortAnswer).trim() : ''
      return {
        questionId: q.id,
        type: 'shortAnswer',
        selectedOptionId: null,
        shortAnswer: text.length > 0 ? text : null,
      }
    }),
  }
}

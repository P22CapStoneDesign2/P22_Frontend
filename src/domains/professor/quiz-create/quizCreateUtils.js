/** 클라이언트 전용 임시 ID (API 연동 전) */
export function genQuizItemId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * 객관식 기본 보기 2개를 가진 신규 문제
 * 화면/저장 시 번호는 배열 인덱스로만 계산 (questionNumber 필드는 상태에 두지 않음)
 *
 * correctOptionIds: 객관식 정답은 복수 선택을 허용하므로 배열로 보관 (단일 선택도 배열에 1개로 표현)
 */
export function createNewQuestion() {
  return {
    id: genQuizItemId(),
    content: '',
    type: 'multipleChoice',
    options: [
      { id: genQuizItemId(), text: '' },
      { id: genQuizItemId(), text: '' },
    ],
    correctOptionIds: [],
    shortAnswer: '',
    explanation: '',
  }
}

/**
 * 저장용 DTO로 변환 (콘솔 출력·추후 API 페이로드 대비)
 *
 * 객관식 정답은 복수 선택 가능하므로, ID 배열을 보존된 보기 인덱스 배열(correctOptionIndexes)로 변환
 *
 * @param {string} materialId
 * @param {Array<object>} questions
 */
export function buildQuizSaveDto(materialId, questions) {
  return {
    materialId,
    questions: questions.map((q, index) => {
      const questionNumber = index + 1
      const isMc = q.type === 'multipleChoice'

      let options = []
      let correctOptionIndexes = []

      if (isMc) {
        const srcOpts = q.options ?? []
        options = srcOpts.map((o) => ({ text: o.text }))
        const idSet = new Set(Array.isArray(q.correctOptionIds) ? q.correctOptionIds : [])
        correctOptionIndexes = srcOpts
          .map((o, i) => (idSet.has(o.id) ? i : -1))
          .filter((i) => i >= 0)
      }

      return {
        questionNumber,
        content: q.content,
        type: q.type,
        options,
        correctOptionIndexes,
        shortAnswer: q.type === 'shortAnswer' ? q.shortAnswer : null,
        explanation: q.explanation,
      }
    }),
  }
}

/** 편집 화면 저장용 DTO (신규 저장 DTO와 동일한 questions 형식 + quizId) */
export function buildQuizEditDto(quizId, materialId, questions) {
  const { questions: payloadQuestions } = buildQuizSaveDto(materialId, questions)
  return {
    quizId,
    materialId,
    questions: payloadQuestions,
  }
}

/** mock/API에서 넘어온 문제 목록을 상태에 넣기 전 얕은 복사 (원본 변형 방지) */
export function cloneQuestionsForState(questions) {
  return questions.map((q) => ({
    ...q,
    options: (q.options ?? []).map((o) => ({ ...o })),
    correctOptionIds: Array.isArray(q.correctOptionIds) ? [...q.correctOptionIds] : [],
    persistedOptionIds: Array.isArray(q.persistedOptionIds) ? [...q.persistedOptionIds] : undefined,
  }))
}

/** API 단답/객관 구분 (명세 §20) */
export const API_QUESTION_TYPE = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  SHORT_ANSWER: 'SHORT_ANSWER',
}

const DEFAULT_SCORE = 10

/**
 * 서버에 이미 저장된 문항 id인지 (수정 화면에서 DELETE 추적용).
 * GET 상세 등으로 받은 문항은 숫자 문자열인 경우가 많고, 편집기에서 새로 만든 문항은 `genQuizItemId()` 등 비숫자 문자열입니다.
 *
 * @param {string|number|null|undefined} id
 * @returns {boolean}
 */
export function isPersistedQuestionId(id) {
  if (id == null || id === '') return false
  if (typeof id === 'number') return Number.isFinite(id)
  const s = String(id).trim()
  return /^\d+$/.test(s)
}

/**
 * 프론트 편집기 문항 → API 문제 추가/수정용 본문 (명세 §20~21)
 *
 * @param {object} editorQuestion
 * @param {string} editorQuestion.id — 서버에서 받은 문항은 숫자 문자열인 경우가 많음. 로컬 신규는 `genQuizItemId()` 등 비숫자 포함. 구분: `isPersistedQuestionId(id)`
 * @param {string} editorQuestion.content
 * @param {'multipleChoice'|'shortAnswer'} editorQuestion.type
 * @param {Array<{ id: string, text: string }>} [editorQuestion.options]
 * @param {string[]} [editorQuestion.correctOptionIds]
 * @param {string} [editorQuestion.shortAnswer]
 * @param {string} [editorQuestion.explanation]
 * @param {object} [overrides]
 * @param {number} [overrides.score] — 기본 10
 * @returns {{
 *   questionText: string,
 *   questionType: string,
 *   options: Array<{ optionText: string, correct: boolean }>,
 *   correctAnswer: string,
 *   explanation: string,
 *   score: number,
 *   anchorId: null,
 *   lessonPage: null,
 *   lessonParagraph: null,
 * }}
 */
export function mapEditorQuestionToApiQuestionPayload(editorQuestion, overrides = {}) {
  const score = typeof overrides.score === 'number' ? overrides.score : DEFAULT_SCORE
  const isMc = editorQuestion.type === 'multipleChoice'
  const questionType = isMc ? API_QUESTION_TYPE.MULTIPLE_CHOICE : API_QUESTION_TYPE.SHORT_ANSWER

  const srcOpts = Array.isArray(editorQuestion.options) ? editorQuestion.options : []
  const idSet = new Set(Array.isArray(editorQuestion.correctOptionIds) ? editorQuestion.correctOptionIds : [])

  const options = isMc
    ? srcOpts.map((o) => ({
        optionText: o.text ?? '',
        correct: idSet.has(o.id),
      }))
    : []

  let correctAnswer = ''
  if (isMc) {
    const correctTexts = srcOpts.filter((o) => idSet.has(o.id)).map((o) => (o.text ?? '').trim())
    correctAnswer = correctTexts.join(',')
  } else {
    correctAnswer = (editorQuestion.shortAnswer ?? '').trim()
  }

  return {
    questionText: editorQuestion.content ?? '',
    questionType,
    options,
    correctAnswer,
    explanation: editorQuestion.explanation ?? '',
    score,
    // TODO: 교안 앵커 UI 추가 후 서버 필드와 매핑 (명세: anchorId, lessonPage, lessonParagraph)
    anchorId: null,
    lessonPage: null,
    lessonParagraph: null,
  }
}

/**
 * 문제 수정 PUT 본문 — 명세상 `questionType` 변경 불가이므로 필드를 제외합니다.
 *
 * @param {object} editorQuestion — `mapEditorQuestionToApiQuestionPayload`와 동일 형태
 * @param {object} [overrides]
 * @returns {Omit<ReturnType<typeof mapEditorQuestionToApiQuestionPayload>, 'questionType'>}
 */
export function mapEditorQuestionToApiQuestionUpdatePayload(editorQuestion, overrides = {}) {
  const full = mapEditorQuestionToApiQuestionPayload(editorQuestion, overrides)
  const { questionType: _questionTypeOmitted, ...updatePayload } = full
  return updatePayload
}

/**
 * @param {object[]} questions — 편집기 문항 배열
 * @param {object} [overrides] — mapEditorQuestionToApiQuestionUpdatePayload에 그대로 전달
 */
export function mapEditorQuestionsToApiQuestionUpdatePayloads(questions, overrides = {}) {
  return questions.map((q) => mapEditorQuestionToApiQuestionUpdatePayload(q, overrides))
}

/**
 * @param {object[]} questions — 편집기 문항 배열
 * @param {object} [overrides] — mapEditorQuestionToApiQuestionPayload에 그대로 전달
 */
export function mapEditorQuestionsToApiQuestionPayloads(questions, overrides = {}) {
  return questions.map((q) => mapEditorQuestionToApiQuestionPayload(q, overrides))
}

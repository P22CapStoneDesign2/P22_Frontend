/** API 단답/객관 구분 (명세 §20) */
export const API_QUESTION_TYPE = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  SHORT_ANSWER: 'SHORT_ANSWER',
}

const DEFAULT_SCORE = 10

/**
 * @param {unknown} type
 * @returns {'multipleChoice' | 'shortAnswer'}
 */
function normalizeEditorQuestionType(type) {
  const t = String(type ?? '').trim()
  if (t === 'shortAnswer' || t === 'SHORT_ANSWER') return 'shortAnswer'
  return 'multipleChoice'
}

/**
 * POST /api/quiz — lessonId (Long) 파싱. invalid면 null
 * @param {unknown} lessonId
 * @returns {number|null}
 */
export function parseLessonIdForApi(lessonId) {
  if (lessonId == null) return null
  if (typeof lessonId === 'number' && Number.isFinite(lessonId) && lessonId > 0) {
    return Math.trunc(lessonId)
  }
  const s = String(lessonId).trim()
  if (!s || s === 'undefined' || s === 'null') return null
  const n = Number(s)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.trunc(n)
}

/**
 * POST /api/quiz 생성 본문 (명세: title, description, lessonId, questions)
 * @param {object} params
 * @param {unknown} params.lessonId
 * @param {string} params.title
 * @param {string} [params.description]
 * @param {object[]} params.questions — 편집기 문항
 * @param {object} [params.questionOverrides] — mapEditorQuestionToApiQuestionPayload overrides
 */
export function buildQuizCreateApiPayload({ lessonId, title, description = '', questions, questionOverrides = {} }) {
  const lessonIdNum = parseLessonIdForApi(lessonId)
  if (lessonIdNum == null) {
    throw new Error('LESSON_ID_REQUIRED')
  }

  const apiQuestions = mapEditorQuestionsToApiQuestionPayloads(questions ?? [], questionOverrides)

  // 백엔드 QuizCreateRequestDto 필드명은 materialId (Long). lessonId 아님.
  return {
    title: String(title ?? '').trim() || '새 퀴즈',
    description: String(description ?? ''),
    materialId: lessonIdNum,
    questions: apiQuestions,
  }
}

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
  const score =
    typeof overrides.score === 'number' && Number.isFinite(overrides.score)
      ? Math.trunc(overrides.score)
      : DEFAULT_SCORE
  const isMc = normalizeEditorQuestionType(editorQuestion?.type) === 'multipleChoice'
  const questionType = isMc ? API_QUESTION_TYPE.MULTIPLE_CHOICE : API_QUESTION_TYPE.SHORT_ANSWER
  const questionText = String(editorQuestion?.content ?? '').trim()
  const explanation = String(editorQuestion?.explanation ?? '').trim()

  const anchorFields = {
    anchorId: null,
    lessonPage: null,
    lessonParagraph: null,
  }

  if (isMc) {
    const srcOpts = Array.isArray(editorQuestion?.options) ? editorQuestion.options : []
    const idSet = new Set(
      (Array.isArray(editorQuestion?.correctOptionIds) ? editorQuestion.correctOptionIds : []).map(
        (id) => String(id),
      ),
    )
    srcOpts.forEach((o) => {
      if (o && (o.correct === true || o.isCorrect === true) && o.id != null) {
        idSet.add(String(o.id))
      }
    })

    const options = srcOpts
      .map((o) => {
        const optionText = String(o?.text ?? '').trim()
        const oid = o?.id != null ? String(o.id) : ''
        return {
          optionText,
          correct: oid ? idSet.has(oid) : false,
        }
      })
      .filter((o) => o.optionText.length > 0)

    const correctFromFlags = options.filter((o) => o.correct).map((o) => o.optionText)
    const correctAnswer =
      correctFromFlags.length > 0
        ? correctFromFlags.join(', ')
        : String(editorQuestion?.correctAnswer ?? '').trim()

    return {
      questionText,
      questionType,
      options,
      correctAnswer,
      explanation,
      score,
      ...anchorFields,
    }
  }

  const correctAnswer = String(
    editorQuestion?.shortAnswer ?? editorQuestion?.correctAnswer ?? '',
  ).trim()

  return {
    questionText,
    questionType,
    options: [],
    correctAnswer,
    explanation,
    score,
    ...anchorFields,
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

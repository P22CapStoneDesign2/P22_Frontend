/**
 * GET /api/quiz/{quizId} 응답(data) → 퀴즈 편집기 preload 번들
 *
 * 정답 preload는 응답에 다음 중 하나라도 있을 때 동작한다 (둘 다 있으면 `correct` 우선):
 * - 객관식: 각 보기에 `correct: boolean`, 또는 문항에 `correctAnswer: string` (쉼표로 복수 정답 구분)
 * - 단답형: 문항에 `correctAnswer: string`
 *
 * 백엔드가 학생에게 정답을 숨기기 위해 응답에서 빼는 경우(`API-SPEC.md §18` 주석 참고),
 * 교수 편집용 응답에서는 이 필드들을 포함시켜야 정답 UI가 채워진다.
 */

const API_MC = 'MULTIPLE_CHOICE'

/** @param {object} q — API question 객체 */
function mapApiQuestionToEditorQuestion(q) {
  const qt = q?.questionType
  const type = qt === API_MC ? 'multipleChoice' : 'shortAnswer'

  const rawOptions = Array.isArray(q?.options) ? q.options : []
  const options = rawOptions.map((o) => ({
    id: String(o?.id ?? ''),
    text: o?.optionText != null ? String(o.optionText) : '',
  }))

  const rawCorrectAnswer = typeof q?.correctAnswer === 'string' ? q.correctAnswer : ''
  let correctOptionIds = []
  let shortAnswer = ''

  if (type === 'multipleChoice') {
    const byCorrectFlag = rawOptions
      .map((o, i) => (o?.correct === true ? options[i]?.id : null))
      .filter(Boolean)

    if (byCorrectFlag.length > 0) {
      correctOptionIds = byCorrectFlag
    } else if (rawCorrectAnswer) {
      const wantedTexts = rawCorrectAnswer
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      correctOptionIds = options
        .filter((o) => wantedTexts.includes(o.text.trim()))
        .map((o) => o.id)
    }
  } else if (type === 'shortAnswer') {
    shortAnswer = rawCorrectAnswer
  }

  return {
    id: String(q?.id ?? ''),
    content: q?.questionText != null ? String(q.questionText) : '',
    type,
    options,
    correctOptionIds,
    shortAnswer,
    explanation: q?.explanation != null ? String(q.explanation) : '',
    score: typeof q?.score === 'number' ? q.score : 10,
    anchorId: q?.anchorId ?? null,
    lessonPage: q?.lessonPage ?? null,
    lessonParagraph: q?.lessonParagraph ?? null,
  }
}

/**
 * @param {object} apiData — GET /api/quiz/{id} 의 `data`
 * @param {string|undefined} routeQuizId — URL :quizId (활성 문항 매칭용, mock 라우트와 동일 패턴)
 * @returns {{
 *   editorQuizId: string,
 *   materialId: string,
 *   title: string,
 *   description: string,
 *   questions: object[],
 *   initialActiveQuestionId: string,
 * }}
 */
export function mapQuizDetailToEditorBundle(apiData, routeQuizId) {
  const editorQuizId = String(apiData?.id ?? '')
  const title = typeof apiData?.title === 'string' ? apiData.title : ''
  const description = typeof apiData?.description === 'string' ? apiData.description : ''
  const raw = Array.isArray(apiData?.questions) ? apiData.questions : []
  const questions = raw.map(mapApiQuestionToEditorQuestion)

  const firstAnchor = raw[0]?.anchorId
  const materialId =
    firstAnchor != null && firstAnchor !== '' && firstAnchor !== undefined ? String(firstAnchor) : ''

  let initialActiveQuestionId = questions[0]?.id ?? ''
  if (routeQuizId != null && String(routeQuizId) !== '') {
    const hit = questions.find((p) => p.id === String(routeQuizId))
    if (hit) initialActiveQuestionId = hit.id
  }

  return {
    editorQuizId,
    materialId,
    title,
    description,
    questions,
    initialActiveQuestionId,
  }
}

/**
 * GET /api/quiz/{quizId} 응답(data) → 학생 풀이 화면 번들
 *
 * 결과 객체:
 * - `quizId`, `title`, `materialId`
 * - `questions`: `{ id, questionNumber, content, type, options }` — 정답 정보는 포함하지 않는다.
 *
 * @param {object} apiData
 * @param {string|undefined} routeQuizId
 */
export function mapQuizDetailToSolveBundle(apiData, routeQuizId) {
  const quizId = String(apiData?.id ?? routeQuizId ?? '')
  const title = typeof apiData?.title === 'string' ? apiData.title : ''
  const raw = Array.isArray(apiData?.questions) ? apiData.questions : []

  const firstAnchor = raw[0]?.anchorId
  const materialId =
    firstAnchor != null && firstAnchor !== '' && firstAnchor !== undefined ? String(firstAnchor) : ''

  const questions = raw.map((q, i) => {
    const qt = q?.questionType
    const type = qt === API_MC ? 'multipleChoice' : 'shortAnswer'
    const options = Array.isArray(q?.options)
      ? q.options.map((o) => ({
          id: String(o?.id ?? ''),
          text: o?.optionText != null ? String(o.optionText) : '',
        }))
      : []
    return {
      id: String(q?.id ?? ''),
      questionNumber: i + 1,
      content: q?.questionText != null ? String(q.questionText) : '',
      type,
      options,
    }
  })

  return { quizId, title, materialId, questions }
}

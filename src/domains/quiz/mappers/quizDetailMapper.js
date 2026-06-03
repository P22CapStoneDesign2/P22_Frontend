/**
 * GET /api/quiz/{quizId} 응답(data) → 퀴즈 편집기 preload 번들
 *
 * TODO(quiz): 상세 응답에 교수용 correctAnswer·보기별 correct가 포함되면
 * correctOptionIds / shortAnswer 를 채워 정답 UI를 preload 할 것.
 */

import { readApiOptionId } from './quizMapper.js'
import { genQuizItemId } from '../../professor/quiz-create/quizCreateUtils.js'

const API_MC = 'MULTIPLE_CHOICE'
const API_SA = 'SHORT_ANSWER'

/**
 * GET /api/quiz/{id}·/edit 응답에서 문항 배열 추출
 * @param {object|null|undefined} apiData
 * @returns {unknown[]}
 */
export function extractQuizQuestionsFromApiData(apiData) {
  if (!apiData || typeof apiData !== 'object') return []
  const candidates = [apiData.questions, apiData.questionList, apiData.items]
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) return c
  }
  for (const c of candidates) {
    if (Array.isArray(c)) return c
  }
  return []
}

/**
 * @param {object} q — API question 객체
 */
function mapApiQuestionToEditorQuestion(q, { includeCorrect = false } = {}) {
  const qt = q?.questionType
  const type = qt === API_MC ? 'multipleChoice' : 'shortAnswer'

  const options = Array.isArray(q?.options)
    ? q.options.map((o) => {
        const serverOptionId = readApiOptionId(o)
        return {
          id: serverOptionId || genQuizItemId(),
          serverOptionId: serverOptionId || undefined,
          text: o?.optionText != null ? String(o.optionText) : '',
        }
      })
    : []
  const persistedOptionIds = options
    .map((o) => o.serverOptionId ?? o.id)
    .filter((id) => id !== '' && /^\d+$/.test(String(id)))

  let correctOptionIds = []
  let shortAnswer = ''

  if (includeCorrect) {
    if (type === 'multipleChoice' && Array.isArray(q?.options)) {
      correctOptionIds = q.options
        .filter((o) => o?.correct === true && o?.id != null)
        .map((o) => String(o.id))
      if (correctOptionIds.length === 0 && q?.correctAnswer != null) {
        const ca = String(q.correctAnswer).trim()
        const byId = q.options.find((o) => o?.id != null && String(o.id) === ca)
        if (byId?.id != null) {
          correctOptionIds = [String(byId.id)]
        } else {
          const idx = Number.parseInt(ca, 10)
          if (Number.isFinite(idx) && idx > 0 && q.options[idx - 1]?.id != null) {
            correctOptionIds = [String(q.options[idx - 1].id)]
          }
        }
      }
    }
    if (type === 'shortAnswer' && q?.correctAnswer != null) {
      shortAnswer = String(q.correctAnswer)
    }
  }

  return {
    id: String(q?.id ?? ''),
    content: q?.questionText != null ? String(q.questionText) : '',
    type,
    options,
    persistedOptionIds,
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
  const raw = extractQuizQuestionsFromApiData(apiData)
  const questions = raw.map((item) => mapApiQuestionToEditorQuestion(item))

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
 * GET /api/quiz/{id}/edit — 교수 수정 preload
 * @param {object} apiData
 * @param {string|undefined} routeQuizId
 */
export function mapQuizEditToEditorBundle(apiData, routeQuizId) {
  const editorQuizId = String(apiData?.id ?? '')
  const title = typeof apiData?.title === 'string' ? apiData.title : ''
  const description = typeof apiData?.description === 'string' ? apiData.description : ''
  const raw = extractQuizQuestionsFromApiData(apiData)
  const questions = raw.map((item) => mapApiQuestionToEditorQuestion(item, { includeCorrect: true }))

  const materialId =
    apiData?.materialId != null
      ? String(apiData.materialId)
      : apiData?.lessonId != null
        ? String(apiData.lessonId)
        : ''

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

import { deleteQuestion } from '../api/quizApi.js'
import { genQuizItemId } from '../../professor/quiz-create/quizCreateUtils.js'
import { nowDateString } from '../../professor/materials/materialUtils.js'

/** 교안별 퀴즈 mock 저장소 — API 연동 전 localStorage (저장·목록·편집 동일 소스) */
export const PROFESSOR_QUIZZES_STORAGE_KEY = 'eqh_professor_quizzes'

/**
 * @typedef {object} StoredQuizQuestion
 * @typedef {object} StoredQuizRecord
 * @property {string} id
 * @property {string} materialId
 * @property {StoredQuizQuestion[]} questions
 * @property {string} updatedAt
 */

/**
 * @returns {StoredQuizRecord[]}
 */
export function loadAllStoredQuizzes() {
  try {
    const raw = localStorage.getItem(PROFESSOR_QUIZZES_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.quizzes)) return []
    return parsed.quizzes
  } catch {
    return []
  }
}

function persistQuizzes(quizzes) {
  try {
    localStorage.setItem(PROFESSOR_QUIZZES_STORAGE_KEY, JSON.stringify({ quizzes }))
  } catch {
    /* ignore */
  }
}

export function genQuizSetId() {
  return `quiz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * @param {string} materialId
 * @returns {StoredQuizRecord[]}
 */
export function loadMaterialQuizRecords(materialId) {
  const mid = String(materialId ?? '')
  return loadAllStoredQuizzes().filter((q) => String(q.materialId) === mid)
}

/**
 * @param {string | undefined} quizSetId
 * @returns {string}
 */
export function getMaterialIdForQuizSet(quizSetId) {
  const id = typeof quizSetId === 'string' ? quizSetId.trim() : ''
  if (!id) return ''
  const record = loadAllStoredQuizzes().find((q) => q.id === id)
  return record?.materialId ?? ''
}

function cloneQuestionForEditor(q) {
  return {
    ...q,
    options: (q.options ?? []).map((o) => ({ ...o })),
    correctOptionIds: Array.isArray(q.correctOptionIds) ? [...q.correctOptionIds] : [],
    persisted: true,
  }
}

/**
 * @param {Array<object>} questions — 편집기 state 형식
 */
function normalizeQuestionsForStorage(questions) {
  return questions.map((q) => ({
    id: q.id ?? genQuizItemId(),
    content: q.content ?? '',
    type: q.type === 'shortAnswer' ? 'shortAnswer' : 'multipleChoice',
    options: (q.options ?? []).map((o) => ({ id: o.id ?? genQuizItemId(), text: o.text ?? '' })),
    correctOptionIds: Array.isArray(q.correctOptionIds) ? [...q.correctOptionIds] : [],
    shortAnswer: q.shortAnswer ?? '',
    explanation: q.explanation ?? '',
  }))
}

/**
 * @param {StoredQuizQuestion} question
 * @returns {'multiple' | 'short'}
 */
export function questionTypeLabelForTableQuestion(question) {
  return question?.type === 'shortAnswer' ? 'short' : 'multiple'
}

/**
 * 문항 1개 → 관리 테이블 행
 */
export function mapStoredQuestionToTableRow(record, question, displayIndex) {
  const content =
    typeof question.content === 'string' && question.content.trim()
      ? question.content.trim()
      : '—'

  return {
    id: `${record.id}:${question.id}`,
    quizSetId: record.id,
    questionId: question.id,
    materialId: record.materialId,
    question: content,
    questionType: questionTypeLabelForTableQuestion(question),
    updatedAt: record.updatedAt ?? '',
    rowNumber: displayIndex + 1,
  }
}

export function flattenStoredQuizzesToTableRows(records) {
  const rows = []
  let displayIndex = 0
  for (const record of records) {
    const questions = Array.isArray(record.questions) ? record.questions : []
    for (const question of questions) {
      if (!question?.id) continue
      rows.push(mapStoredQuestionToTableRow(record, question, displayIndex))
      displayIndex += 1
    }
  }
  return rows
}

export function loadQuizTableRowsForMaterial(materialId) {
  return flattenStoredQuizzesToTableRows(loadMaterialQuizRecords(materialId))
}

export function countExistingQuestionsForMaterial(materialId) {
  return loadQuizTableRowsForMaterial(materialId).length
}

/**
 * 교안 수정 화면 — 해당 교안의 전체 문항 로드 (여러 퀴즈 세트 병합)
 * @param {string} materialId
 * @param {string | null | undefined} [preferredActiveQuestionId]
 */
export function getMaterialEditBundleFromStorage(materialId, preferredActiveQuestionId = null) {
  const mid = String(materialId ?? '')
  if (!mid) return null

  const records = loadMaterialQuizRecords(mid)
  const questions = []
  const persistedQuestionIds = []

  for (const record of records) {
    for (const q of record.questions ?? []) {
      if (!q?.id) continue
      persistedQuestionIds.push(q.id)
      questions.push(cloneQuestionForEditor(q))
    }
  }

  const preferred =
    typeof preferredActiveQuestionId === 'string' ? preferredActiveQuestionId.trim() : ''
  const initialActiveQuestionId =
    preferred && questions.some((q) => q.id === preferred)
      ? preferred
      : (questions[0]?.id ?? '')

  return {
    materialId: mid,
    questions,
    persistedQuestionIds,
    primaryQuizSetId: records[0]?.id ?? null,
    initialActiveQuestionId,
  }
}

/**
 * 교안 단위 저장 — 해당 material의 세트를 하나로 통합
 * @param {string} materialId
 * @param {Array<object>} questions
 * @param {string[]} initialPersistedQuestionIds 저장 시점 기준 기존 persisted id
 */
export function saveMaterialQuestionsConsolidated(materialId, questions, initialPersistedQuestionIds) {
  const mid = String(materialId)
  const all = loadAllStoredQuizzes()
  const materialRecords = loadMaterialQuizRecords(mid)
  const primaryQuizSetId = materialRecords[0]?.id ?? genQuizSetId()

  const currentIds = new Set(questions.map((q) => q.id).filter(Boolean))
  const deletedPersistedIds = (initialPersistedQuestionIds ?? []).filter((id) => !currentIds.has(id))
  const updatedQuestions = questions.filter((q) => q.persisted === true || initialPersistedQuestionIds?.includes(q.id))
  const addedQuestions = questions.filter(
    (q) => !initialPersistedQuestionIds?.includes(q.id),
  )

  const withoutMaterial = all.filter((q) => String(q.materialId) !== mid)
  const record = {
    id: primaryQuizSetId,
    materialId: mid,
    questions: normalizeQuestionsForStorage(questions),
    updatedAt: nowDateString(),
  }
  persistQuizzes([...withoutMaterial, record])

  return {
    quizSetId: primaryQuizSetId,
    deletedPersistedIds,
    updatedCount: updatedQuestions.length,
    addedCount: addedQuestions.length,
  }
}

/**
 * 교안에서 문항 삭제 (localStorage) — API는 deleteQuestionsForMaterial에서 호출
 * @param {string} materialId
 * @param {string[]} questionIdsToDelete
 */
export function removeQuestionsFromMaterial(materialId, questionIdsToDelete) {
  const mid = String(materialId ?? '')
  const idSet = new Set((questionIdsToDelete ?? []).map(String))
  if (idSet.size === 0) return

  const bundle = getMaterialEditBundleFromStorage(mid)
  if (!bundle || bundle.questions.length === 0) {
    const all = loadAllStoredQuizzes().filter((q) => String(q.materialId) !== mid)
    persistQuizzes(all)
    return
  }

  const remaining = bundle.questions.filter((q) => !idSet.has(q.id))
  if (remaining.length === 0) {
    const all = loadAllStoredQuizzes().filter((q) => String(q.materialId) !== mid)
    persistQuizzes(all)
    return
  }

  saveMaterialQuestionsConsolidated(
    mid,
    remaining,
    remaining.map((q) => q.id),
  )
}

/**
 * 문항 단위 삭제 — persisted면 deleteQuestion API, 이후 저장소 반영
 * @param {string} materialId
 * @param {Array<{ quizSetId: string, questionId: string }>} items
 */
export async function deleteQuestionsForMaterial(materialId, items) {
  const list = Array.isArray(items) ? items : []
  if (list.length === 0) return

  await Promise.all(
    list.map(({ quizSetId, questionId }) =>
      deleteQuestion(quizSetId, questionId).catch(() => undefined),
    ),
  )

  removeQuestionsFromMaterial(
    materialId,
    list.map((i) => i.questionId),
  )
}

/**
 * 퀴즈 생성 저장 — 동일 교안에 기존 세트가 있으면 문항 병합
 */
export function saveNewQuizForMaterial(materialId, questions) {
  const mid = String(materialId)
  const materialRecords = loadMaterialQuizRecords(mid)
  const normalizedNew = normalizeQuestionsForStorage(questions)

  if (materialRecords.length === 0) {
    const id = genQuizSetId()
    const record = {
      id,
      materialId: mid,
      questions: normalizedNew,
      updatedAt: nowDateString(),
    }
    persistQuizzes([...loadAllStoredQuizzes(), record])
    return id
  }

  const existingQuestions = materialRecords.flatMap((r) =>
    (r.questions ?? []).map((q) => normalizeQuestionsForStorage([q])[0]),
  )
  return saveMaterialQuestionsConsolidated(
    mid,
    [...existingQuestions, ...normalizedNew],
    existingQuestions.map((q) => q.id),
  ).quizSetId
}

/** @deprecated materialId 기준 getMaterialEditBundleFromStorage 사용 */
export function updateStoredQuiz(quizId, materialId, questions) {
  return saveMaterialQuestionsConsolidated(
    materialId,
    questions,
    loadMaterialQuizRecords(materialId).flatMap((r) => (r.questions ?? []).map((q) => q.id)),
  )
}

/** @deprecated materialId 기준 getMaterialEditBundleFromStorage 사용 */
export function getQuizEditBundleFromStorage(quizId, preferredActiveQuestionId = null) {
  const materialId = getMaterialIdForQuizSet(quizId)
  if (!materialId) return null
  return getMaterialEditBundleFromStorage(materialId, preferredActiveQuestionId)
}

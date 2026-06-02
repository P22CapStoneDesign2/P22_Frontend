/**
 * 퀴즈 생성 화면 — lessonId 해석 (URL param · query · location state)
 * @param {object} sources
 * @param {string|undefined} sources.materialIdParam — route :materialId
 * @param {URLSearchParams | null} [sources.searchParams]
 * @param {object|null|undefined} [sources.locationState]
 * @returns {string} 유효한 lessonId 문자열, 없으면 ''
 */
export function resolveQuizCreateLessonId({ materialIdParam, searchParams, locationState }) {
  const fromParam = normalizeLessonIdCandidate(materialIdParam)
  if (fromParam) return fromParam

  if (searchParams) {
    const fromQuery =
      searchParams.get('lessonId') ?? searchParams.get('materialId') ?? searchParams.get('lesson_id') ?? ''
    const q = normalizeLessonIdCandidate(fromQuery)
    if (q) return q
  }

  if (locationState && typeof locationState === 'object') {
    const fromState =
      locationState.lessonId ?? locationState.materialId ?? locationState.lesson_id ?? null
    const s = normalizeLessonIdCandidate(fromState)
    if (s) return s
  }

  return ''
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function normalizeLessonIdCandidate(value) {
  if (value == null) return ''
  const s = String(value).trim()
  if (!s || s === 'undefined' || s === 'null') return ''
  return s
}

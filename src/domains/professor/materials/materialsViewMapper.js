/**
 * 교안 관리 — API lesson DTO → 피그마 UI ViewModel (강의명/교안명 분리)
 */

/** 강의 추가 시 API lesson.title 기본값 (강의 표시명과 분리) */
export const DEFAULT_LESSON_MATERIAL_TITLE = '새 교안'

/**
 * @param {Array<{ id: string, title: string }>} lessons
 * @returns {Array<{ id: string }>}
 */
export function mapLessonsToCourseIdList(lessons) {
  if (!Array.isArray(lessons)) return []
  return lessons.map((l) => ({ id: l.id }))
}

/**
 * @param {Array<{ id: string, title: string }>} lessons
 * @param {Record<string, string>} courseNameById
 * @returns {Array<{ value: string, label: string }>}
 */
export function mapCourseDropdownOptions(lessons, courseNameById) {
  if (!Array.isArray(lessons)) return []
  return lessons.map((l) => ({
    value: l.id,
    label: (courseNameById[l.id] ?? l.title ?? '').trim() || '—',
  }))
}

/**
 * @param {string} lessonId
 * @param {Record<string, string>} lessonTitleById
 * @param {Record<string, { createdAt?: string, updatedAt?: string }>} lessonMetaById
 * @param {(date?: string) => string} formatDate
 * @returns {Array<{ id: string, fileName: string, createdAt: string, updatedAt: string }>}
 */
export function mapSelectedLessonToMaterialRows(lessonId, lessonTitleById, lessonMetaById, formatDate) {
  if (!lessonId) return []
  const meta = lessonMetaById[lessonId]
  const title = (lessonTitleById[lessonId] ?? '').trim() || '—'
  return [
    {
      id: lessonId,
      fileName: title,
      createdAt: formatDate(meta?.createdAt),
      updatedAt: formatDate(meta?.updatedAt),
    },
  ]
}

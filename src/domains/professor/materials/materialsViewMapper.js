/**
 * 교안 관리 — Lesson / LessonMaterial API → 피그마 UI ViewModel (강의·교안 분리)
 */

/** 교안(파일) 추가 시 기본 제목 */
export const DEFAULT_MATERIAL_TITLE = '새 교안'

/**
 * @param {Array<{ id: string, title: string }>} lessons
 * @returns {Array<{ id: string }>}
 */
export function mapLessonsToCourseIdList(lessons) {
  if (!Array.isArray(lessons)) return []
  return lessons.map((l) => ({ id: l.id }))
}

/**
 * 강의 드롭다운 — lesson.title 만 (material.title 사용 금지)
 * @param {Array<{ id: string, title: string }>} lessons
 */
export function mapCourseDropdownOptions(lessons) {
  if (!Array.isArray(lessons)) return []
  return lessons.map((l) => ({
    value: l.id,
    label: String(l.title ?? '—').trim() || '—',
  }))
}

/**
 * 교안 테이블 — material.title 만 (lesson.title fallback 금지)
 * @param {Array<{ materialId: string, lessonId: string, title: string, createdAt: string, updatedAt: string }>} materials
 * @param {(date?: string) => string} formatDate
 */
export function mapMaterialsToTableRows(materials, formatDate) {
  if (!Array.isArray(materials)) return []
  return materials.map((m, index) => ({
    materialId: m.materialId,
    lessonId: m.lessonId,
    title: m.title,
    id: m.materialId,
    fileName: m.title,
    createdAt: formatDate(m.createdAt),
    updatedAt: formatDate(m.updatedAt),
    rowNumber: index + 1,
  }))
}

/** @deprecated */
export const DEFAULT_LESSON_MATERIAL_TITLE = DEFAULT_MATERIAL_TITLE

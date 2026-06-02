/**
 * 교안별 퀴즈 관리 — API DTO → 피그마 UI용 ViewModel
 * (강의/교안/퀴즈 3단 구조는 화면에 유지, 백엔드 lesson 계층은 여기서 매핑)
 */

/**
 * @typedef {{ value: string, label: string }} DropdownOption
 */

/**
 * GET /api/lessons 목록 항목 → 교안 드롭다운 옵션
 * @param {{ id: string, title: string } | null | undefined} lesson
 * @returns {DropdownOption | null}
 */
export function mapLessonListItemToMaterialOption(lesson) {
  if (!lesson?.id) return null
  return {
    value: String(lesson.id),
    label: String(lesson.title ?? '—').trim() || '—',
  }
}

/**
 * 강의(lessonId) 선택 후 교안 옵션 — API에 course 계층이 없어도 UI는 교안 선택을 유지
 * @param {Array<{ id: string, title: string }>} lessons
 * @param {string|number} courseLessonId
 * @returns {DropdownOption[]}
 */
export function mapMaterialOptionsForCourseLesson(lessons, courseLessonId) {
  const id = String(courseLessonId ?? '').trim()
  if (!id || !Array.isArray(lessons)) return []
  const lesson = lessons.find((l) => l.id === id)
  const opt = mapLessonListItemToMaterialOption(lesson)
  return opt ? [opt] : []
}

/**
 * @param {DropdownOption | null | undefined} material
 * @returns {string}
 */
export function materialOptionLabel(material) {
  return material?.label?.trim() || '—'
}

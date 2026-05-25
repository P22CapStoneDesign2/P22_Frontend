/**
 * 교수 UI — 강의 표시명(피그마 "강의") 로컬 저장
 * 백엔드에는 course API가 없으므로 lessonId별 UI 라벨만 분리합니다.
 * 교안명(lesson.title)은 API PUT /api/lessons 로만 변경합니다.
 */

const STORAGE_KEY = 'eqh_prof_course_display_titles'

/**
 * @returns {Record<string, string>}
 */
export function readAllCourseDisplayTitles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    /** @type {Record<string, string>} */
    const out = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.trim()) out[String(key)] = value.trim()
    }
    return out
  } catch {
    return {}
  }
}

/**
 * @param {string|number} lessonId
 * @returns {string}
 */
export function readCourseDisplayTitle(lessonId) {
  const id = String(lessonId ?? '').trim()
  if (!id) return ''
  return readAllCourseDisplayTitles()[id] ?? ''
}

/**
 * @param {string|number} lessonId
 * @param {string} title
 */
export function writeCourseDisplayTitle(lessonId, title) {
  const id = String(lessonId ?? '').trim()
  const name = String(title ?? '').trim()
  if (!id || !name) return
  const all = readAllCourseDisplayTitles()
  all[id] = name
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

/**
 * @param {string|number} lessonId
 */
export function removeCourseDisplayTitle(lessonId) {
  const id = String(lessonId ?? '').trim()
  if (!id) return
  const all = readAllCourseDisplayTitles()
  if (!(id in all)) return
  delete all[id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

/**
 * 강의 드롭다운 라벨 — 저장된 표시명 우선, 없으면 lesson API title
 * @param {string|number} lessonId
 * @param {string} [lessonApiTitle]
 * @returns {string}
 */
export function resolveCourseDisplayLabel(lessonId, lessonApiTitle) {
  const stored = readCourseDisplayTitle(lessonId)
  if (stored) return stored
  const api = String(lessonApiTitle ?? '').trim()
  return api || '—'
}

/**
 * GET /api/lessons · /api/lessons/my 응답 → UI 옵션·테이블 행
 */

/**
 * @param {unknown} item
 * @returns {{ value: string, label: string } | null}
 */
export function mapLessonItemToCourseOption(item) {
  if (!item || typeof item !== 'object') return null
  const id = item.id
  if (id === undefined || id === null) return null
  const label = String(item.title ?? item.name ?? '—').trim() || '—'
  return { value: String(id), label }
}

/**
 * @param {unknown[]} content
 * @returns {Array<{ value: string, label: string }>}
 */
export function mapLessonsToCourseOptions(content) {
  if (!Array.isArray(content)) return []
  return content
    .map(mapLessonItemToCourseOption)
    .filter((o) => o != null)
}

/**
 * @param {unknown} item
 * @param {number} index
 * @returns {{ lessonId: string, title: string, dateLabel: string, rowNumber: number } | null}
 */
export function mapLessonItemToStudentTableRow(item, index) {
  if (!item || typeof item !== 'object') return null
  const id = item.id
  if (id === undefined || id === null) return null
  const title = String(item.title ?? '—').trim() || '—'
  const rawDate = item.approvedAt ?? item.updatedAt ?? item.createdAt ?? ''
  return {
    lessonId: String(id),
    title,
    dateLabel: formatLessonDateLabel(rawDate),
    rowNumber: index + 1,
  }
}

/**
 * @param {unknown} raw
 */
export function formatLessonDateLabel(raw) {
  if (!raw) return '—'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return String(raw)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

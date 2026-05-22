/** @typedef {{ id: string, name: string, professorName: string }} SubjectRow */

/** @typedef {{ enrollmentId: string, studentId: string, name: string, nickname: string, requestedDate: string, decidedDate: string }} EnrollmentRow */

export function matchesQuery(text, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return String(text ?? '')
    .toLowerCase()
    .includes(q)
}

/** @param {SubjectRow[]} subjects @param {string} query */
export function filterSubjects(subjects, query) {
  const q = query.trim().toLowerCase()
  if (!q) return subjects
  return subjects.filter(
    (s) => matchesQuery(s.name, q) || matchesQuery(s.professorName, q),
  )
}

/** @param {EnrollmentRow[]} rows @param {string} query */
export function filterEnrollmentRows(rows, query) {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter(
    (row) =>
      matchesQuery(row.name, q) ||
      matchesQuery(row.nickname, q) ||
      matchesQuery(row.studentId, q),
  )
}

/** @param {unknown} iso */
export function formatApiDate(iso) {
  if (!iso) return '—'
  const d = new Date(String(iso))
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString('ko-KR')
}

/** @param {unknown} item */
export function mapLessonToSubject(item) {
  if (!item || typeof item !== 'object') return null
  const id = item.id
  if (id === undefined || id === null) return null
  return {
    id: String(id),
    name: String(item.title ?? item.name ?? '—'),
    professorName: String(item.createdByName ?? item.professorName ?? '—'),
  }
}

/** @param {unknown} item */
export function mapEnrollmentToRow(item) {
  if (!item || typeof item !== 'object') return null
  const enrollmentId = item.id
  if (enrollmentId === undefined || enrollmentId === null) return null
  return {
    enrollmentId: String(enrollmentId),
    studentId: String(item.studentId ?? '—'),
    name: String(item.studentName ?? '—'),
    nickname: String(item.studentNickname ?? '—'),
    requestedDate: formatApiDate(item.requestedAt),
    decidedDate: formatApiDate(item.decidedAt),
  }
}

/**
 * @param {{ listLoading?: boolean, listError?: string, hasSelection?: boolean, filteredCount: number, totalCount: number, searchQuery: string, emptyLabels: { noSelection: string, noData: string, noSearch: string, loading: string } }} opts
 */
export function tableEmptyMessage(opts) {
  const {
    listLoading = false,
    listError = '',
    hasSelection = true,
    filteredCount,
    totalCount,
    searchQuery,
    emptyLabels,
  } = opts

  if (listLoading) return { text: emptyLabels.loading, isError: false }
  if (listError) return { text: listError, isError: true }
  if (!hasSelection) return { text: emptyLabels.noSelection, isError: false }
  if (filteredCount > 0) return null
  if (searchQuery.trim()) return { text: emptyLabels.noSearch, isError: false }
  if (totalCount === 0) return { text: emptyLabels.noData, isError: false }
  return { text: emptyLabels.noSearch, isError: false }
}

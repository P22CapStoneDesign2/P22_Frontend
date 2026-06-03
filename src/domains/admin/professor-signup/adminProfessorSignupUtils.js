/** @typedef {'PENDING' | 'APPROVED' | 'REJECTED'} ProfSignupStatus */

/** @typedef {{ userId: string, name: string, email: string, nickname: string, requestedDate: string, status: ProfSignupStatus }} ProfSignupRow */

export function matchesQuery(text, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return String(text ?? '')
    .toLowerCase()
    .includes(q)
}

/** @param {ProfSignupRow[]} rows @param {string} query */
export function filterProfSignupRows(rows, query) {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter(
    (row) =>
      matchesQuery(row.name, q) ||
      matchesQuery(row.email, q) ||
      matchesQuery(row.nickname, q),
  )
}

/** @param {unknown} iso */
export function formatApiDate(iso) {
  if (!iso) return '—'
  const d = new Date(String(iso))
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString('ko-KR')
}

/** @param {unknown} raw */
function normalizeSignupStatus(raw) {
  const v = String(raw ?? '').toUpperCase()
  if (v === 'APPROVED' || v === 'REJECTED') return /** @type {ProfSignupStatus} */ (v)
  return 'PENDING'
}

/** @param {unknown} item */
export function mapProfessorSignupToRow(item) {
  if (!item || typeof item !== 'object') return null
  const userId = item.id ?? item.userId
  if (userId === undefined || userId === null) return null
  return {
    userId: String(userId),
    name: String(item.username ?? item.name ?? '—'),
    email: String(item.email ?? '—'),
    nickname: String(item.nickname ?? '—'),
    requestedDate: formatApiDate(item.requestedAt ?? item.createdAt),
    status: normalizeSignupStatus(item.status ?? item.signupStatus ?? item.signup_status),
  }
}

/**
 * @param {{ listLoading?: boolean, listError?: string, filteredCount: number, totalCount: number, searchQuery: string, emptyLabels: { noData: string, noSearch: string, loading: string } }} opts
 */
export function tableEmptyMessage(opts) {
  const { listLoading = false, listError = '', filteredCount, totalCount, searchQuery, emptyLabels } =
    opts

  if (listLoading) return { text: emptyLabels.loading, isError: false }
  if (listError) return { text: listError, isError: true }
  if (filteredCount > 0) return null
  if (searchQuery.trim()) return { text: emptyLabels.noSearch, isError: false }
  if (totalCount === 0) return { text: emptyLabels.noData, isError: false }
  return { text: emptyLabels.noSearch, isError: false }
}

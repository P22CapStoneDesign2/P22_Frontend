/** 클라이언트 전용 임시 ID */
export function genMaterialFileId() {
  return `mf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function genCourseId() {
  return `course-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function nowDateString() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * 교안 업로드/등록일 표시 (예: 2026-04-30 → 2026년 4월 30일)
 * @param {string | undefined} dateStr
 * @returns {string}
 */
export function formatMaterialUploadDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '—'
  const trimmed = dateStr.trim()
  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) {
    const year = Number(iso[1])
    const month = Number(iso[2])
    const day = Number(iso[3])
    if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}년 ${month}월 ${day}일`
    }
  }
  return trimmed
}

export function isPdfFile(file) {
  if (!file) return false
  const nameOk = file.name?.toLowerCase().endsWith('.pdf')
  const typeOk = file.type === 'application/pdf' || file.type === ''
  return nameOk || typeOk
}

/**
 * @param {Array<{ id: string, name: string }>} courses
 * @param {Record<string, Array<{ id: string, fileName: string, createdAt: string, updatedAt: string }>>} materialFilesByCourseId
 */
export function buildMaterialsSaveDto(courses, materialFilesByCourseId) {
  return {
    courses: courses.map((c) => ({
      id: c.id,
      name: c.name,
      materials: (materialFilesByCourseId[c.id] ?? []).map((m) => ({
        id: m.id,
        fileName: m.fileName,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
    })),
  }
}

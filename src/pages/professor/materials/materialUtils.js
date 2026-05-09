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

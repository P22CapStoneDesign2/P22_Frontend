/**
 * LessonMaterial API DTO → UI ViewModel
 */

/**
 * @param {unknown} item
 * @returns {{ materialId: string, lessonId: string, title: string, description: string, createdAt: string, updatedAt: string } | null}
 */
export function mapLessonMaterialDto(item) {
  if (!item || typeof item !== 'object' || item.id == null) return null
  return {
    materialId: String(item.id),
    lessonId: item.lessonId != null ? String(item.lessonId) : '',
    title: String(item.title ?? '—').trim() || '—',
    description: item.description != null ? String(item.description) : '',
    fileUrl: item.fileUrl != null ? String(item.fileUrl) : null, // 파일 URL
    createdAt: item.createdAt != null ? String(item.createdAt) : '',
    updatedAt: item.updatedAt != null ? String(item.updatedAt) : '',
  }
}

/**
 * @param {unknown[]} content
 */
export function mapLessonMaterialList(content) {
  if (!Array.isArray(content)) return []
  return content.map(mapLessonMaterialDto).filter((r) => r != null)
}

/**
 * @param {ReturnType<typeof mapLessonMaterialDto>[]} materials
 * @param {(raw?: string) => string} formatDate
 */
export function mapLessonMaterialsToTableRows(materials, formatDate) {
  if (!Array.isArray(materials)) return []
  return materials.map((m, index) => ({
    id: m.materialId,
    fileName: m.title,
    fileUrl: m.fileUrl ?? null, // 파일 URL
    createdAt: formatDate(m.createdAt),
    updatedAt: formatDate(m.updatedAt),
    rowNumber: index + 1,
  }))
}

/**
 * @param {ReturnType<typeof mapLessonMaterialDto>[]} materials
 */
export function mapLessonMaterialsToDropdownOptions(materials) {
  if (!Array.isArray(materials)) return []
  return materials.map((m) => ({
    value: m.materialId,
    label: m.title || '—',
  }))
}

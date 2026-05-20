import { buildMaterialsSaveDto, formatMaterialUploadDate } from './materialUtils.js'

/** 교안 관리 저장 mock — API 연동 전 localStorage 공유 */
export const PROFESSOR_MATERIALS_STORAGE_KEY = 'eqh_professor_materials'

/**
 * @typedef {{ id: string, name: string, materials: Array<{ id: string, fileName: string, createdAt: string, updatedAt: string }> }} SavedCourseDto
 * @typedef {{ courses: SavedCourseDto[] }} ProfessorMaterialsDto
 */

/**
 * @param {ProfessorMaterialsDto | null | undefined} dto
 * @returns {number}
 */
export function countSavedMaterials(dto) {
  if (!dto?.courses?.length) return 0
  return dto.courses.reduce((sum, c) => sum + (c.materials?.length ?? 0), 0)
}

/**
 * @returns {ProfessorMaterialsDto | null}
 */
export function loadProfessorMaterialsDto() {
  try {
    const raw = localStorage.getItem(PROFESSOR_MATERIALS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.courses)) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * @param {Array<{ id: string, name: string }>} courses
 * @param {Record<string, Array<{ id: string, fileName: string, createdAt: string, updatedAt: string }>>} materialFilesByCourseId
 */
export function saveProfessorMaterialsFromState(courses, materialFilesByCourseId) {
  const dto = buildMaterialsSaveDto(courses, materialFilesByCourseId)
  try {
    localStorage.setItem(PROFESSOR_MATERIALS_STORAGE_KEY, JSON.stringify(dto))
  } catch {
    /* quota 등 — mock 단계에서는 무시 */
  }
  return dto
}

/**
 * @param {ProfessorMaterialsDto} dto
 * @returns {{ courses: Array<{ id: string, name: string }>, materialFilesByCourseId: Record<string, Array<{ id: string, fileName: string, createdAt: string, updatedAt: string }>> }}
 */
export function professorMaterialsDtoToState(dto) {
  const courses = dto.courses.map(({ id, name }) => ({ id, name }))
  const materialFilesByCourseId = {}
  dto.courses.forEach((c) => {
    materialFilesByCourseId[c.id] = (c.materials ?? []).map((m) => ({
      id: m.id,
      fileName: m.fileName,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }))
  })
  return { courses, materialFilesByCourseId }
}

/**
 * SelectDropdown 옵션 — 강의
 * @param {ProfessorMaterialsDto | null} dto
 * @returns {Array<{ value: string, label: string }>}
 */
export function courseOptionsFromDto(dto) {
  if (!dto?.courses?.length) return []
  return dto.courses.map((c) => ({ value: c.id, label: c.name }))
}

/**
 * SelectDropdown 옵션 — 교안(파일)
 * @param {ProfessorMaterialsDto | null} dto
 * @param {string} courseId
 * @returns {Array<{ value: string, label: string }>}
 */
export function materialOptionsForCourseFromDto(dto, courseId) {
  if (!dto?.courses?.length || !courseId) return []
  const course = dto.courses.find((c) => c.id === courseId)
  return (course?.materials ?? []).map((m) => ({
    value: m.id,
    label: m.fileName,
  }))
}

/**
 * 학생 교안 목록 테이블 행 (교수 저장소 기준, 정답·파일 내용 노출 없음)
 * @param {ProfessorMaterialsDto | null} dto
 * @param {string} courseId
 * @returns {Array<{ materialId: string, fileName: string, uploadDateDisplay: string, rowNumber: number }>}
 */
export function materialTableRowsForCourseFromDto(dto, courseId) {
  if (!dto?.courses?.length || !courseId) return []
  const course = dto.courses.find((c) => c.id === courseId)
  const materials = course?.materials ?? []
  return materials.map((m, index) => ({
    materialId: m.id,
    fileName: m.fileName || '—',
    uploadDateDisplay: formatMaterialUploadDate(m.createdAt),
    rowNumber: index + 1,
  }))
}

/**
 * @param {import('./professorMaterialsStorage.js').ProfessorMaterialsDto | null} dto
 * @param {string} materialId
 * @returns {string | null}
 */
/**
 * 화면 표시용 교안 이름 (fileName) — materialId는 노출하지 않음
 * @param {string} materialId
 * @param {string} [fallbackLabel] SelectDropdown label 등
 * @returns {string}
 */
export function getMaterialDisplayLabel(materialId, fallbackLabel = '') {
  const mid = String(materialId ?? '')
  if (!mid) return fallbackLabel || '—'

  const dto = loadProfessorMaterialsDto()
  if (!dto?.courses?.length) return fallbackLabel || '—'

  for (const course of dto.courses) {
    const found = (course.materials ?? []).find((m) => m.id === mid)
    if (found?.fileName) return found.fileName
  }

  return fallbackLabel || '—'
}

export function findCourseIdForMaterial(dto, materialId) {
  if (!dto?.courses?.length || !materialId) return null
  const mid = String(materialId)
  for (const c of dto.courses) {
    if ((c.materials ?? []).some((m) => m.id === mid)) return c.id
  }
  return null
}

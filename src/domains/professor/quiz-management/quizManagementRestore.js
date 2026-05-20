import {
  findCourseIdForMaterial,
  materialOptionsForCourseFromDto,
} from '../materials/professorMaterialsStorage.js'
import { loadQuizTableRowsForMaterial } from '../../quiz/storage/professorQuizzesStorage.js'

/**
 * 저장 후 복귀 등 navigation state로 강의·교안·목록 복원
 * @param {import('../materials/professorMaterialsStorage.js').ProfessorMaterialsDto | null} materialsDto
 * @param {{ selectedMaterialId?: string, materialId?: string } | null | undefined} locationState
 */
export function restoreQuizManagementSelection(materialsDto, locationState) {
  const materialId = locationState?.materialId ?? locationState?.selectedMaterialId
  if (!materialId || !materialsDto) return null

  const courseId = findCourseIdForMaterial(materialsDto, materialId)
  if (!courseId) return null

  const course = materialsDto.courses.find((c) => c.id === courseId)
  if (!course) return null

  const materials = materialOptionsForCourseFromDto(materialsDto, courseId)
  const selectedMaterial = materials.find((m) => m.value === materialId) ?? null
  if (!selectedMaterial) return null

  return {
    selectedCourse: { value: course.id, label: course.name },
    materials,
    selectedMaterial,
    quizzes: loadQuizTableRowsForMaterial(materialId),
  }
}

import {
  fetchProfessorCourseOptions,
  fetchQuizMgmtMaterialOptionsForCourse,
} from '../../catalog/lessonCatalogService.js'
import { fetchQuizTableRowsForLesson } from '../../catalog/quizCatalogService.js'

/**
 * @param {{ lessonId?: string, courseId?: string, materialId?: string, selectedMaterialId?: string } | null | undefined} locationState
 */
export async function restoreQuizManagementSelection(locationState) {
  const materialId =
    locationState?.materialId ??
    locationState?.selectedMaterialId ??
    locationState?.lessonId
  const courseId = locationState?.courseId ?? materialId

  const courses = await fetchProfessorCourseOptions()
  if (courses.length === 0) return null

  const selectedCourse = courseId ? courses.find((c) => c.value === String(courseId)) ?? null : null

  let materials = []
  let selectedMaterial = null

  if (selectedCourse) {
    materials = await fetchQuizMgmtMaterialOptionsForCourse(selectedCourse.value)
    if (materialId) {
      selectedMaterial = materials.find((m) => m.value === String(materialId)) ?? materials[0] ?? null
    }
  }

  const lessonIdForQuiz = selectedMaterial?.value ?? ''
  const quizzes = lessonIdForQuiz ? await fetchQuizTableRowsForLesson(lessonIdForQuiz) : []

  return {
    selectedCourse,
    materials,
    selectedMaterial,
    quizzes,
  }
}

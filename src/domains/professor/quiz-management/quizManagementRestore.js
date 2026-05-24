import { fetchProfessorCourseOptions } from '../../catalog/lessonCatalogService.js'
import { fetchQuizTableRowsForLesson } from '../../catalog/quizCatalogService.js'

/**
 * @param {{ lessonId?: string, courseId?: string, selectedMaterialId?: string } | null | undefined} locationState
 */
export async function restoreQuizManagementSelection(locationState) {
  const lessonId =
    locationState?.lessonId ??
    locationState?.courseId ??
    locationState?.selectedMaterialId

  const courses = await fetchProfessorCourseOptions()
  if (courses.length === 0) return null

  const selectedCourse = lessonId
    ? courses.find((c) => c.value === String(lessonId)) ?? null
    : null

  const quizzes = selectedCourse ? await fetchQuizTableRowsForLesson(selectedCourse.value) : []

  return {
    selectedCourse,
    quizzes,
  }
}

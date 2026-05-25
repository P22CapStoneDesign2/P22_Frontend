import { apiResponseData } from '../../api/apiResponse.js'
import {
  getLesson,
  getLessons,
  getMyLessons,
  lessonPageContent,
} from '../../api/lessons.js'
import {
  formatLessonDateLabel,
  mapLessonItemToStudentTableRow,
  mapLessonsToCourseOptions,
  mapLessonsToCourseOptionsWithDisplayNames,
} from './lessonCatalogMapper.js'
import { readAllCourseDisplayTitles } from '../professor/materials/professorCourseDisplayStorage.js'
import { mapMaterialOptionsForCourseLesson } from '../quiz/mappers/quizManagementViewMapper.js'

const LIST_PAGE = { page: 0, size: 200 }

/**
 * @param {import('axios').AxiosResponse} res
 * @returns {unknown[]}
 */
function safeLessonContent(res) {
  try {
    return lessonPageContent(res)
  } catch {
    return []
  }
}

/**
 * 교수 — GET /api/lessons
 * @returns {Promise<Array<{ value: string, label: string }>>}
 */
export async function fetchProfessorCourseOptions() {
  try {
    const res = await getLessons(LIST_PAGE)
    const displayById = readAllCourseDisplayTitles()
    return mapLessonsToCourseOptionsWithDisplayNames(safeLessonContent(res), displayById)
  } catch {
    return []
  }
}

/**
 * 교수 교안 관리 — GET /api/lessons 전체 메타
 * @returns {Promise<Array<{ id: string, title: string, description: string, createdAt: string, updatedAt: string }>>}
 */
export async function fetchProfessorLessonsList() {
  try {
    const res = await getLessons(LIST_PAGE)
    const content = safeLessonContent(res)
    return content
      .map((item) => {
        if (!item || typeof item !== 'object' || item.id == null) return null
        return {
          id: String(item.id),
          title: String(item.title ?? '—').trim() || '—',
          description: item.description != null ? String(item.description) : '',
          createdAt: item.createdAt != null ? String(item.createdAt) : '',
          updatedAt: item.updatedAt != null ? String(item.updatedAt) : '',
        }
      })
      .filter((r) => r != null)
  } catch {
    return []
  }
}

/**
 * 학생 — GET /api/lessons/my
 * @returns {Promise<Array<{ value: string, label: string }>>}
 */
export async function fetchStudentCourseOptions() {
  try {
    const res = await getMyLessons(LIST_PAGE)
    return mapLessonsToCourseOptions(safeLessonContent(res))
  } catch {
    return []
  }
}

/**
 * 학생 교안 보기 테이블 — 승인 교안 목록
 * @returns {Promise<Array<{ lessonId: string, title: string, dateLabel: string, rowNumber: number }>>}
 */
export async function fetchStudentLessonTableRows() {
  try {
    const res = await getMyLessons(LIST_PAGE)
    const content = safeLessonContent(res)
    return content
      .map((item, i) => mapLessonItemToStudentTableRow(item, i))
      .filter((r) => r != null)
  } catch {
    return []
  }
}

/**
 * GET /api/lessons/{id}
 * @param {string|number} lessonId
 * @returns {Promise<object|null>}
 */
export async function fetchLessonDetail(lessonId) {
  const id = String(lessonId ?? '').trim()
  if (!id) return null
  try {
    const res = await getLesson(id)
    return apiResponseData(res)
  } catch {
    return null
  }
}

/**
 * @param {string|number} lessonId
 * @returns {Promise<string>}
 */
export async function fetchLessonTitle(lessonId) {
  const lesson = await fetchLessonDetail(lessonId)
  const title = lesson?.title
  if (typeof title === 'string' && title.trim()) return title.trim()
  return '—'
}

/**
 * 교안별 퀴즈 관리 — 강의 선택 후 교안 드롭다운 옵션
 * API에 course 엔티티가 없어 동일 lesson을 교안 1건으로 노출 (피그마 UI 유지)
 * @param {string|number} courseLessonId
 * @returns {Promise<Array<{ value: string, label: string }>>}
 */
export async function fetchQuizMgmtMaterialOptionsForCourse(courseLessonId) {
  const id = String(courseLessonId ?? '').trim()
  if (!id) return []
  try {
    const list = await fetchProfessorLessonsList()
    return mapMaterialOptionsForCourseLesson(list, id)
  } catch {
    return []
  }
}

export { formatLessonDateLabel }

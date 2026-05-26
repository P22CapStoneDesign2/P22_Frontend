/* 교안(Lesson) · 수강 신청 API — axios instance 규칙 준수 */
import instance from './axios.js'

/**
 * Spring Page 응답에서 content 배열 추출
 * @param {import('axios').AxiosResponse} res
 * @returns {unknown[]}
 */
export function lessonPageContent(res) {
  const data = res?.data?.data
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data)) return data
  return []
}

/**
 * GET /api/lessons — 교안 목록 (페이지네이션)
 * @param {{ page?: number, size?: number, sort?: string }} [params]
 */
export const getLessons = (params = {}) => instance.get('/api/lessons', { params })

/**
 * GET /api/admin/lessons — 관리자 전체 교안 목록 (§14)
 * @param {{ page?: number, size?: number, sort?: string }} [params]
 */
export const getAdminLessons = (params = {}) => instance.get('/api/admin/lessons', { params })

/**
 * 관리자 화면용 교안 목록 — `/api/admin/lessons` 실패 시 `/api/lessons` 폴백
 * @param {{ page?: number, size?: number, sort?: string }} [params]
 */
export async function getLessonsForAdmin(params = {}) {
  try {
    return await getAdminLessons(params)
  } catch {
    return getLessons(params)
  }
}

/**
 * GET /api/lessons/my — 학생 본인 APPROVED 교안 목록
 * @param {{ page?: number, size?: number }} [params]
 */
export const getMyLessons = (params = {}) => instance.get('/api/lessons/my', { params })

/**
 * POST /api/lessons/{id}/enrollments — 수강 신청 (PENDING)
 * @param {string|number} lessonId
 */
export const enrollInLesson = (lessonId) =>
  instance.post(`/api/lessons/${encodeURIComponent(String(lessonId))}/enrollments`)

/**
 * DELETE /api/lessons/{id}/enrollments — PENDING 신청 취소
 * @param {string|number} lessonId
 */
export const cancelLessonEnrollment = (lessonId) =>
  instance.delete(`/api/lessons/${encodeURIComponent(String(lessonId))}/enrollments`)

/**
 * GET /api/lessons/{id}/enrollments — 교수·관리자 신청 목록
 * @param {string|number} lessonId
 * @param {{ status?: string, page?: number, size?: number }} [params]
 */
export const getLessonEnrollments = (lessonId, params = {}) =>
  instance.get(`/api/lessons/${encodeURIComponent(String(lessonId))}/enrollments`, { params })

/**
 * POST .../approve · .../reject
 * @param {string|number} lessonId
 * @param {string|number} enrollmentId
 */
export const approveLessonEnrollment = (lessonId, enrollmentId) =>
  instance.post(
    `/api/lessons/${encodeURIComponent(String(lessonId))}/enrollments/${encodeURIComponent(String(enrollmentId))}/approve`,
  )

export const rejectLessonEnrollment = (lessonId, enrollmentId) =>
  instance.post(
    `/api/lessons/${encodeURIComponent(String(lessonId))}/enrollments/${encodeURIComponent(String(enrollmentId))}/reject`,
  )

/**
 * POST /api/lessons — 교안(lesson) 생성
 * @param {{ title: string, description?: string }} body
 */
export const createLesson = (body) => instance.post('/api/lessons', body)

/**
 * PUT /api/lessons/{id}
 * @param {string|number} lessonId
 * @param {{ title: string, description?: string }} body
 */
export const updateLesson = (lessonId, body) =>
  instance.put(`/api/lessons/${encodeURIComponent(String(lessonId))}`, body)

/**
 * DELETE /api/lessons/{id}
 * @param {string|number} lessonId
 */
export const deleteLesson = (lessonId) =>
  instance.delete(`/api/lessons/${encodeURIComponent(String(lessonId))}`)

/**
 * GET /api/lessons/{lessonId} — 강의 단건
 * @param {string|number} lessonId
 */
export const getLesson = (lessonId) =>
  instance.get(`/api/lessons/${encodeURIComponent(String(lessonId))}`)

/**
 * GET /api/lessons/{lessonId}/materials/{materialId}
 * @param {string|number} lessonId
 * @param {string|number} materialId
 */
export const getLessonMaterial = (lessonId, materialId) =>
  instance.get(
    `/api/lessons/${encodeURIComponent(String(lessonId))}/materials/${encodeURIComponent(String(materialId))}`,
  )

function materialsBasePath(lessonId) {
  return `/api/lessons/${encodeURIComponent(String(lessonId))}/materials`
}

/**
 * POST /api/lessons/{lessonId}/materials
 * @param {string|number} lessonId
 * @param {{ title: string, description?: string }} body
 */
export const createLessonMaterial = (lessonId, body) =>
  instance.post(materialsBasePath(lessonId), body)

/**
 * GET /api/lessons/{lessonId}/materials
 * @param {string|number} lessonId
 * @param {{ page?: number, size?: number, sort?: string }} [params]
 */
export const getLessonMaterials = (lessonId, params = {}) =>
  instance.get(materialsBasePath(lessonId), { params })

/**
 * PUT /api/lessons/{lessonId}/materials/{materialId}
 */
export const updateLessonMaterial = (lessonId, materialId, body) =>
  instance.put(`${materialsBasePath(lessonId)}/${encodeURIComponent(String(materialId))}`, body)

/**
 * DELETE /api/lessons/{lessonId}/materials/{materialId}
 */
export const deleteLessonMaterial = (lessonId, materialId) =>
  instance.delete(`${materialsBasePath(lessonId)}/${encodeURIComponent(String(materialId))}`)

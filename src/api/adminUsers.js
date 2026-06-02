/* 관리자 — 교수 가입 승인 API (axios instance 규칙 준수) */
import instance from './axios.js'

/**
 * Spring Page 응답에서 content 배열 추출
 * @param {import('axios').AxiosResponse} res
 * @returns {unknown[]}
 */
export function adminUserPageContent(res) {
  const data = res?.data?.data
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data)) return data
  return []
}

/**
 * GET /api/admin/professors — 교수 가입 신청 목록 (§33)
 * @param {{ status?: 'PENDING' | 'APPROVED' | 'REJECTED', page?: number, size?: number, sort?: string }} [params]
 */
export const getAdminProfessorSignups = (params = {}) =>
  instance.get('/api/admin/professors', { params })

/**
 * POST /api/admin/professors/{userId}/approve — 교수 가입 승인 (§34)
 * @param {string|number} userId
 */
export const approveProfessorSignup = (userId) =>
  instance.post(`/api/admin/professors/${encodeURIComponent(String(userId))}/approve`)

/**
 * POST /api/admin/professors/{userId}/reject — 교수 가입 거절 (§35)
 * @param {string|number} userId
 */
export const rejectProfessorSignup = (userId) =>
  instance.post(`/api/admin/professors/${encodeURIComponent(String(userId))}/reject`)

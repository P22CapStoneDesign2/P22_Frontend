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
 * GET /api/admin/professors/pending — 교수 가입 신청 목록 (§33)
 * @param {{ status?: 'PENDING' | 'APPROVED' | 'REJECTED', signupStatus?: 'PENDING' | 'APPROVED' | 'REJECTED', page?: number, size?: number, sort?: string }} [params]
 */
export const getAdminProfessorSignups = (params = {}) =>
  instance.get('/api/admin/professors/pending', { params })

/** @param {unknown} err */
function isRetryableProfessorSignupListError(err) {
  const status = err?.response?.status
  return status === 500 || status === 400
}

/** 백엔드 구현 차이(sort 필드·status 파라미터명) 대응 — §33 */
const PROFESSOR_SIGNUP_LIST_PARAM_ATTEMPTS = [
  { status: 'PENDING', page: 0, size: 200, sort: 'createdAt,ASC' },
  { status: 'PENDING', page: 0, size: 200 },
  { status: 'PENDING', page: 0, size: 200, sort: 'createdAt,DESC' },
  { signupStatus: 'PENDING', page: 0, size: 200 },
  { page: 0, size: 200 },
]

/**
 * 교수 가입 신청 목록 — 500/400 시 쿼리 조합을 순차 재시도
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchAdminProfessorSignupsForPage() {
  let lastError
  for (const params of PROFESSOR_SIGNUP_LIST_PARAM_ATTEMPTS) {
    try {
      return await getAdminProfessorSignups(params)
    } catch (err) {
      lastError = err
      if (!isRetryableProfessorSignupListError(err)) throw err
    }
  }
  throw lastError
}

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

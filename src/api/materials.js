/* 교안(Material) PDF 뷰어 관련 API — Base URL·Bearer는 axios·env 규칙 준수 */
import instance from './axios.js'

/**
 * §15 예시 `success: false` 또는 공통 형식 `status`(200·201 외)일 때 메시지를 던집니다.
 * @param {import('axios').AxiosResponse<any> | undefined} res
 */
export function parseMaterialResponse(res) {
  const body = res?.data
  if (!body || typeof body !== 'object') return body
  if (body.success === false) {
    const m = body.message
    throw new Error(typeof m === 'string' && m.length ? m : '요청에 실패했습니다.')
  }
  const st = body.status
  if (typeof st === 'number' && st !== 200 && st !== 201) {
    const m = body.message
    throw new Error(typeof m === 'string' && m.length ? m : '요청에 실패했습니다.')
  }
  if (Object.prototype.hasOwnProperty.call(body, 'data')) return body.data
  return body
}

/** API `aspectRatio` 문자열(`16:9`)을 CSS `aspect-ratio` 값으로 변환 */
export function parseAspectRatioString(raw) {
  if (raw == null || typeof raw !== 'string') return null
  const m = String(raw).trim().match(/^(\d+)\s*:\s*(\d+)$/)
  return m ? `${m[1]} / ${m[2]}` : null
}

/** @param {string|number} lectureId */
export const getLectureMaterials = (lectureId) =>
  instance.get(`/api/lectures/${encodeURIComponent(String(lectureId))}/materials`)

/** @param {string|number} materialId */
export const getMaterialDetail = (materialId) =>
  instance.get(`/api/materials/${encodeURIComponent(String(materialId))}`)

/** @param {string|number} materialId */
export const getMaterialViewer = (materialId) =>
  instance.get(`/api/materials/${encodeURIComponent(String(materialId))}/viewer`)

/**
 * @param {string|number} materialId
 * @param {string|number} pageNumber
 */
export const getMaterialPageImage = (materialId, pageNumber) =>
  instance.get(
    `/api/materials/${encodeURIComponent(String(materialId))}/pages/${encodeURIComponent(String(pageNumber))}`,
  )

/**
 * @param {string|number} materialId
 * @param {number} currentPage — 백엔드 규칙(보통 1부터)
 */
export const postMaterialProgress = (materialId, currentPage) =>
  instance.post(`/api/materials/${encodeURIComponent(String(materialId))}/progress`, {
    currentPage,
  })

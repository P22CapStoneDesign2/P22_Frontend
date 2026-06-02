import { API_BASE_URL } from '../../../config/env.js'
import instance from '../../../api/axios.js'

/**
 * PDF.js는 기본적으로 Bearer를 붙이지 않으므로, API와 동일 오리진인 경우 axios로 blob 후 object URL을 씁니다.
 *
 * @param {string} pdfUrl
 * @returns {Promise<{ file: string; revoke?: () => void }>}
 */
export async function resolvePdfFileForViewer(pdfUrl) {
  if (!pdfUrl) {
    throw new Error('pdfUrl 없음')
  }

  if (!API_BASE_URL) {
    return { file: pdfUrl }
  }

  let pdfOrigin
  let apiOrigin
  try {
    pdfOrigin = new URL(pdfUrl).origin
    apiOrigin = new URL(API_BASE_URL).origin
  } catch {
    return { file: pdfUrl }
  }

  if (pdfOrigin !== apiOrigin) {
    return { file: pdfUrl }
  }

  let path
  if (pdfUrl.startsWith(API_BASE_URL)) {
    path = pdfUrl.slice(API_BASE_URL.length)
  } else {
    const u = new URL(pdfUrl)
    path = `${u.pathname}${u.search}`
  }
  path = path.startsWith('/') ? path : `/${path}`
  const res = await instance.get(path, { responseType: 'blob' })
  const blob =
    res.data instanceof Blob
      ? res.data
      : new Blob([res.data], { type: res.headers['content-type'] || 'application/pdf' })
  const objectUrl = URL.createObjectURL(blob)
  return {
    file: objectUrl,
    revoke: () => URL.revokeObjectURL(objectUrl),
  }
}

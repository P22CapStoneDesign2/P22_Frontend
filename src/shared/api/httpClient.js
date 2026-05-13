/**
 * fetch 기반 공통 API 클라이언트.
 * - 베이스 URL: `config/env.js`의 `API_BASE_URL` (= `VITE_API_BASE_URL` 정규화)
 * - 공통 응답 `{ status, message, data }` 중 `data` 반환
 * - 실패 시 본문 `message` 기준으로 Error throw
 */
import { API_BASE_URL } from '../../config/env.js'
import { getAccessToken } from '../auth/tokenStorage.js'

/**
 * @param {string} path - `/api/...` 형태 (선행 `/` 없으면 붙임)
 * @param {RequestInit & { json?: unknown }} options
 * @returns {Promise<unknown>}
 */
export async function httpClient(path, options = {}) {
  const base = API_BASE_URL
  if (!base) {
    throw new Error('API 베이스 URL이 설정되지 않았습니다. VITE_API_BASE_URL을 확인하세요.')
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${base}${normalizedPath}`

  const { json, ...rest } = options
  const headers = new Headers(rest.headers ?? {})

  const token = getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let body = rest.body
  if (json !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(json)
  }

  const response = await fetch(url, {
    ...rest,
    headers,
    body,
  })

  const text = await response.text()
  /** @type {{ status?: number, message?: string, data?: unknown } | null} */
  let parsed = null
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      if (!response.ok) {
        throw new Error(response.statusText || `HTTP ${response.status}`)
      }
      throw new Error('응답 본문을 JSON으로 파싱할 수 없습니다.')
    }
  }

  const httpOk = response.ok
  const businessStatus = typeof parsed?.status === 'number' ? parsed.status : null
  const businessFailed = businessStatus != null && businessStatus >= 400

  if (!httpOk || businessFailed) {
    const msg =
      (parsed && typeof parsed.message === 'string' && parsed.message.length > 0
        ? parsed.message
        : null) ||
      response.statusText ||
      `요청 실패 (HTTP ${response.status})`
    throw new Error(msg)
  }

  return parsed && 'data' in parsed ? parsed.data : null
}

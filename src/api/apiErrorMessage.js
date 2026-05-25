/**
 * axios 실패 시 envelope message 추출 (Auth 모듈과 분리)
 * @param {unknown} err
 * @param {string} [fallback]
 * @returns {string}
 */
export function getApiErrorMessage(err, fallback = '요청에 실패했습니다.') {
  const body = err && typeof err === 'object' && 'response' in err ? err.response?.data : null
  if (body && typeof body === 'object' && typeof body.message === 'string') {
    const msg = body.message.trim()
    if (msg) return msg
  }
  if (err instanceof Error && err.message.trim()) return err.message.trim()
  return fallback
}

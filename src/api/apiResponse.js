/**
 * 공통 API 응답 `{ status, message, data }` 에서 `data` 추출
 * @param {import('axios').AxiosResponse} res
 */
export function apiResponseData(res) {
  const body = res?.data
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data
  }
  return body ?? null
}

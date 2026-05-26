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

/**
 * @param {unknown} err
 * @returns {string}
 */
export function getApiErrorCode(err) {
  const body = err && typeof err === 'object' && 'response' in err ? err.response?.data : null
  if (!body || typeof body !== 'object') return ''
  const code = body.code ?? body.errorCode ?? body.error
  return code != null ? String(code).trim() : ''
}

/**
 * POST /api/quiz/{quizId}/submit — 409 QUIZ_ALREADY_SUBMITTED
 * @param {unknown} err
 */
export function isQuizAlreadySubmittedError(err) {
  const status = err && typeof err === 'object' && 'response' in err ? err.response?.status : null
  if (status !== 409) return false
  const code = getApiErrorCode(err).toUpperCase()
  if (code === 'QUIZ_ALREADY_SUBMITTED') return true
  const msg = getApiErrorMessage(err, '').toLowerCase()
  return msg.includes('이미 제출한 퀴즈')
}

/**
 * 퀴즈 제출 API 오류 메시지 (409 중복 제출은 결과 이동 안내)
 * @param {unknown} err
 */
export function getQuizSubmitErrorMessage(err) {
  if (isQuizAlreadySubmittedError(err)) {
    return '이미 제출한 퀴즈입니다. 결과 화면으로 이동합니다.'
  }
  return getApiErrorMessage(err, '퀴즈 제출에 실패했습니다.')
}

export const QUIZ_ALREADY_SUBMITTED_NO_RESULT_MESSAGE =
  '이미 제출한 퀴즈입니다. 결과 조회 API가 없어 해설을 불러올 수 없습니다.'

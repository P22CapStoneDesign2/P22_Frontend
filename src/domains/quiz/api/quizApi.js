/* 퀴즈 API — CLAUDE.md 규칙 #1·#4: `src/api/axios.js`의 instance를 통해서만 호출하고
 * 토큰/401 재발급은 인터셉터에 위임한다.
 *
 * 반환값은 AxiosResponse 원본 — 호출부에서 공통 응답 `{ status, message, data }` 중 `data`를
 * `res.data.data`로 추출해 매퍼에 넘긴다 (`src/api/auth.js`·`materials.js`와 동일 패턴).
 */
import instance from '../../../api/axios.js'

/** undefined·null 값을 제거한 axios params 객체 — `key=null` 직렬화 방지 */
function cleanParams(params) {
  const out = {}
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    out[k] = v
  })
  return out
}

/**
 * @param {object} payload — 명세: title, description?
 */
export function createQuiz(payload) {
  return instance.post('/api/quiz', payload)
}

/**
 * @param {Record<string, string | number | undefined | null>} [params] — page, size, sort 등
 */
export function getQuizzes(params = {}) {
  return instance.get('/api/quiz', { params: cleanParams(params) })
}

export function getQuizDetail(quizId) {
  return instance.get(`/api/quiz/${encodeURIComponent(String(quizId))}`)
}

/**
 * 교수 본인·ADMIN 전용 — 정답(`correctAnswer`, 보기별 `correct`)을 포함한 편집용 응답.
 * 학생 풀이 화면에서는 사용하지 않는다 — 그쪽은 `getQuizDetail`.
 */
export function getQuizDetailForEdit(quizId) {
  return instance.get(`/api/quiz/${encodeURIComponent(String(quizId))}/edit`)
}

/**
 * getQuizEditDetail(quizId)?
 * @param {string|number} quizId
 * @param {object} payload — 명세: title, description?
 */
export function updateQuiz(quizId, payload) {
  return instance.put(`/api/quiz/${encodeURIComponent(String(quizId))}`, payload)
}

export function deleteQuiz(quizId) {
  return instance.delete(`/api/quiz/${encodeURIComponent(String(quizId))}`)
}

/**
 * @param {string|number} quizId
 * @param {object} payload — 문제 추가 본문 (명세 §20)
 */
export function addQuestion(quizId, payload) {
  return instance.post(
    `/api/quiz/${encodeURIComponent(String(quizId))}/questions`,
    payload,
  )
}

export function updateQuestion(quizId, questionId, payload) {
  const q = encodeURIComponent(String(quizId))
  const qq = encodeURIComponent(String(questionId))
  return instance.put(`/api/quiz/${q}/questions/${qq}`, payload)
}

export function deleteQuestion(quizId, questionId) {
  const q = encodeURIComponent(String(quizId))
  const qq = encodeURIComponent(String(questionId))
  return instance.delete(`/api/quiz/${q}/questions/${qq}`)
}

/**
 * @param {string|number} quizId
 * @param {{ answers: Array<{ questionId: string|number, studentAnswer: string }> }} payload
 */
export function submitQuiz(quizId, payload) {
  return instance.post(
    `/api/quiz/${encodeURIComponent(String(quizId))}/submit`,
    payload,
  )
}

/**
 * @param {Record<string, string | number | undefined | null>} [params] — page, size 등
 */
export function getWrongAnswers(params = {}) {
  return instance.get('/api/quiz/wrong-answers', { params: cleanParams(params) })
}

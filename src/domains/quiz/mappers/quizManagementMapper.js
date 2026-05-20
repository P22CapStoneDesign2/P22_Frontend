import { flattenStoredQuizzesToTableRows } from '../storage/professorQuizzesStorage.js'

/**
 * 교수 퀴즈 관리 — GET /api/quiz 페이지 응답을 테이블 행 형태로 변환
 *
 * TODO: 백엔드에서 교안(lesson)별 퀴즈/문제 목록 API가 생기면 이 매핑·호출 파라미터를 교체해야 합니다.
 * 현재 GET /api/quiz는 퀴즈 세트 단위이며, 화면은 기존에 “문제 한 줄”처럼 보이는 컬럼을 유지하고 있습니다.
 *
 * @param {object} apiItem
 * @param {string|number} apiItem.id
 * @param {string} [apiItem.title]
 * @param {string} [apiItem.description]
 * @param {number} [apiItem.questionCount]
 * @param {string} [apiItem.updatedAt]
 * @param {string} [apiItem.createdAt]
 * @param {number} index - 0-based (표시 번호용)
 */
export function mapQuizPageItemToTableRow(apiItem, index) {
  const title = typeof apiItem.title === 'string' ? apiItem.title.trim() : ''
  const desc = typeof apiItem.description === 'string' ? apiItem.description.trim() : ''
  const question = title || desc || '—'

  const count = typeof apiItem.questionCount === 'number' ? apiItem.questionCount : 0
  /** @type {'multiple' | 'mixed'} */
  const questionType = count > 1 ? 'mixed' : 'multiple'

  const updatedAt = apiItem.updatedAt ?? apiItem.createdAt ?? ''

  return {
    id: String(apiItem.id),
    quizNumber: index + 1,
    question,
    questionType,
    updatedAt,
  }
}

/**
 * @param {object|null|undefined} pageData — 공통 응답 `data` (Spring Page)
 * @returns {Array<{ id: string, quizNumber: number, question: string, questionType: 'multiple'|'mixed', updatedAt: string }>}
 */
export function mapQuizListPageDataToTableRows(pageData) {
  const content = pageData?.content
  if (!Array.isArray(content)) return []
  return content.map((item, i) => mapQuizPageItemToTableRow(item, i))
}

/**
 * localStorage mock 저장 레코드 배열 → 문항 단위 테이블 행 (flatten)
 * @param {import('../storage/professorQuizzesStorage.js').StoredQuizRecord[]} records
 */
export function mapStoredQuizRecordsToTableRows(records) {
  return flattenStoredQuizzesToTableRows(records)
}

/**
 * 교수 저장 correctOptionIds 길이 → 학생 선택 허용 개수 (정답 id는 노출하지 않음)
 * @param {string[] | undefined} correctOptionIds
 * @returns {number}
 */
export function getMcRequiredAnswerCount(correctOptionIds) {
  const n = Array.isArray(correctOptionIds)
    ? correctOptionIds.filter((id) => typeof id === 'string' && id.trim()).length
    : 0
  return Math.max(1, n)
}

/**
 * @param {string[] | undefined} selectedOptionIds
 * @param {string} optionId
 * @param {number} maxCount
 * @returns {{ nextIds: string[], blocked: boolean }}
 */
export function toggleMultipleChoiceSelection(selectedOptionIds, optionId, maxCount) {
  const ids = Array.isArray(selectedOptionIds) ? [...selectedOptionIds] : []
  const idx = ids.indexOf(optionId)

  if (idx >= 0) {
    ids.splice(idx, 1)
    return { nextIds: ids, blocked: false }
  }

  if (maxCount <= 1) {
    return { nextIds: [optionId], blocked: false }
  }

  if (ids.length >= maxCount) {
    return { nextIds: ids, blocked: true }
  }

  return { nextIds: [...ids, optionId], blocked: false }
}

/**
 * @param {number} requiredAnswerCount
 * @param {number} selectedCount
 */
export function getMcSelectionHint(requiredAnswerCount, selectedCount) {
  const max = Math.max(1, requiredAnswerCount)
  const instruction =
    max <= 1 ? '정답을 1개 선택하세요.' : `정답을 ${max}개 선택하세요.`
  const progress = `선택: ${selectedCount} / ${max}`

  return { instruction, progress }
}

/**
 * @param {string[] | undefined} a
 * @param {string[] | undefined} b
 */
export function areOptionIdSetsEqual(a, b) {
  const left = [...new Set((a ?? []).map(String))].sort()
  const right = [...new Set((b ?? []).map(String))].sort()
  if (left.length !== right.length) return false
  return left.every((id, i) => id === right[i])
}

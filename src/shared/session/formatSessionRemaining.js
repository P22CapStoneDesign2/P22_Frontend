/**
 * @param {number} remainingMs
 * @returns {{ minutes: number, seconds: number }}
 */
export function splitSessionRemaining(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return { minutes, seconds }
}

/**
 * @param {number} remainingMs
 * @returns {string} 예: "29분 54초"
 */
export function formatSessionRemainingShort(remainingMs) {
  const { minutes, seconds } = splitSessionRemaining(remainingMs)
  return `${minutes}분 ${seconds}초`
}

/** `username`으로 보내는 실명 — API 명세 2~20자 기준 */
export function isValidSignupUsername(value) {
  const v = value.trim()
  if (v.length < 2 || v.length > 20) return false
  return /^[0-9A-Za-z가-힣\s]+$/.test(v)
}

/** 서비스 내 표시용 닉네임 — 2~20자, 특수문자 제외 */
export function isValidDisplayNickname(value) {
  if (value.length < 2 || value.length > 20) return false
  return /^[0-9A-Za-z가-힣]+$/.test(value)
}

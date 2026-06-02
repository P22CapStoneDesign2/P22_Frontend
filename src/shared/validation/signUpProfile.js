/** 백엔드 닉네임 유효성 — API-SPEC §1·§1-1 (2~20자, 영문·숫자·한글) */
export const DISPLAY_NICKNAME_MIN = 2
export const DISPLAY_NICKNAME_MAX = 20

/** 입력 안내·형식 검증 실패 메시지 (최대 길이는 `maxLength`로 제한) */
export const DISPLAY_NICKNAME_HINT = '특수문자를 제외한 2자 이상'

const DISPLAY_NICKNAME_PATTERN = /^[0-9A-Za-z가-힣]+$/

/** `username`으로 보내는 실명 — API 명세 2~20자 기준 */
export function isValidSignupUsername(value) {
  const v = value.trim()
  if (v.length < 2 || v.length > 20) return false
  return /^[0-9A-Za-z가-힣\s]+$/.test(v)
}

/** 서비스 내 표시용 닉네임 — trim 후 길이·문자 종류 검사 (가입 API와 동일 기준) */
export function isValidDisplayNickname(value) {
  const v = String(value ?? '').trim()
  if (v.length < DISPLAY_NICKNAME_MIN || v.length > DISPLAY_NICKNAME_MAX) return false
  return DISPLAY_NICKNAME_PATTERN.test(v)
}

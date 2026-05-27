import { useSessionIdle } from '../../../shared/session/useSessionIdle.js'
import { formatSessionRemainingShort } from '../../../shared/session/formatSessionRemaining.js'
import { getAccessToken } from '../../../shared/auth/tokenStorage.js'

const URGENT_REMAINING_MS = 60 * 1000

/**
 * 로고 오른쪽 — 시간연장 + 남은 시간 (SessionIdleProvider 하위)
 */
export default function HeaderSessionControls() {
  const session = useSessionIdle()
  const hasToken = Boolean(getAccessToken())

  if (!hasToken || !session?.extendSession) {
    return null
  }

  const isUrgent = session.remainingMs <= URGENT_REMAINING_MS
  const timeLabel = formatSessionRemainingShort(session.remainingMs)

  return (
    <div className="edu-header__session" role="group" aria-label="로그인 세션">
      <button type="button" className="edu-header__session-extend" onClick={session.extendSession}>
        시간연장
      </button>
      <p
        className={`edu-header__session-time${isUrgent ? ' edu-header__session-time--urgent' : ''}`}
        aria-live="polite"
      >
        현재 남은 시간은 <span className="edu-header__session-time-value">{timeLabel}</span> 입니다.
      </p>
    </div>
  )
}

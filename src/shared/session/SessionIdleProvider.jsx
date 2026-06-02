import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast/useToast.js'
import { ROUTES } from '../constants/routes.js'
import { logoutAndNavigate } from '../auth/performLogout.js'
import { getAccessToken } from '../auth/tokenStorage.js'
import { SessionIdleContext } from './sessionIdleContext.js'

export const SESSION_DURATION_MS = 30 * 60 * 1000
const WARN_BEFORE_MS = 60 * 1000

/**
 * 프론트 UX 전용 비활성 세션 타이머 (JWT/refresh 미변경)
 */
export default function SessionIdleProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const sessionEndsAtRef = useRef(0)
  const warnedRef = useRef(false)
  const loggingOutRef = useRef(false)
  const [remainingMs, setRemainingMs] = useState(0)
  const pathKey = `${location.pathname}:${location.key}`

  useLayoutEffect(() => {
    if (!getAccessToken()) {
      sessionEndsAtRef.current = 0
      return
    }
    sessionEndsAtRef.current = Date.now() + SESSION_DURATION_MS
    warnedRef.current = false
    loggingOutRef.current = false
  }, [pathKey])

  const extendSession = useCallback(() => {
    if (!getAccessToken()) return
    sessionEndsAtRef.current = Date.now() + SESSION_DURATION_MS
    warnedRef.current = false
    setRemainingMs(SESSION_DURATION_MS)
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!getAccessToken()) {
        setRemainingMs(0)
        return
      }

      const left = Math.max(0, sessionEndsAtRef.current - Date.now())
      setRemainingMs(left)

      if (left > 0 && left <= WARN_BEFORE_MS && !warnedRef.current) {
        warnedRef.current = true
        showToast('로그인 시간이 곧 만료됩니다. 로그인 연장을 눌러주세요.', {
          variant: 'error',
          durationMs: 55_000,
        })
      }

      if (left <= 0 && !loggingOutRef.current) {
        loggingOutRef.current = true
        void logoutAndNavigate(navigate, ROUTES.login)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [navigate, showToast, pathKey])

  const value = useMemo(
    () => ({
      extendSession,
      remainingMs: getAccessToken() ? remainingMs : 0,
    }),
    [extendSession, remainingMs],
  )

  return <SessionIdleContext.Provider value={value}>{children}</SessionIdleContext.Provider>
}

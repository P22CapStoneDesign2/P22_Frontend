import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, logout as logoutApi } from '../../api/auth.js'
import { clearTokens, getRefreshToken } from './tokenStorage.js'
import { ROUTES } from '../constants/routes.js'

/**
 * 페이지 헤더의 `{ userEmail, onLogout }`을 제공한다.
 *
 * - `userEmail`: `GET /api/users/me` 응답의 `email` (조회 실패 시 빈 문자열).
 *   인증 실패(401)는 axios 응답 인터셉터가 재발급/홈 리다이렉트로 처리하므로 여기서는 추가 분기하지 않는다.
 * - `onLogout`: `POST /api/auth/logout` 호출 → 로컬 토큰 삭제 → `ROUTES.home` 이동.
 *   서버 호출이 실패해도 클라이언트 측 정리는 항상 수행한다.
 */
export function useSessionHeader() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    let alive = true
    getMe()
      .then((res) => {
        if (!alive) return
        const email = res?.data?.data?.email
        setUserEmail(typeof email === 'string' ? email : '')
      })
      .catch(() => {
        // 401은 인터셉터에서 처리됨. 그 외 오류는 헤더 이메일을 비워 둔다.
      })
    return () => {
      alive = false
    }
  }, [])

  const onLogout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) await logoutApi(refreshToken)
    } catch {
      // 서버 호출 실패해도 로컬 정리·홈 이동은 진행
    }
    clearTokens()
    navigate(ROUTES.home, { replace: true })
  }, [navigate])

  return { userEmail, onLogout }
}

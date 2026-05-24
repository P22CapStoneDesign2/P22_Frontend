import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../../api/auth.js'
import { logoutAndNavigate } from './performLogout.js'
import { getAccessToken } from './tokenStorage.js'

/**
 * 인증 영역·랜딩 Header용 — GET /api/users/me 이메일 + 로그아웃 핸들러.
 * @param {unknown} [refreshKey] 바뀔 때 프로필 재조회 (예: 랜딩 pathname)
 * @returns {{ userEmail: string, onLogout: () => void }}
 */
export function useAuthHeaderSession(refreshKey) {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState('')

  const syncSession = useCallback(async () => {
    if (!getAccessToken()) return ''
    try {
      const res = await getMe()
      return res.data?.data?.email ?? ''
    } catch {
      return ''
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    syncSession().then((email) => {
      if (!cancelled) setUserEmail(email)
    })
    return () => {
      cancelled = true
    }
  }, [syncSession, refreshKey])

  const onLogout = useCallback(() => logoutAndNavigate(navigate), [navigate])

  return { userEmail, onLogout }
}

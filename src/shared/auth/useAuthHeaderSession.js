import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../../api/auth.js'
import { logoutAndNavigate } from './performLogout.js'
import { ROUTES } from '../constants/routes.js'
import { getAccessToken } from './tokenStorage.js'
import { getRoleDisplayLabel } from './roleDisplayLabel.js'
import { setStoredUserRole } from './roleUtils.js'

/**
 * 인증 영역·랜딩 Header용 — GET /api/users/me 프로필 + 로그아웃 핸들러.
 * @param {unknown} [refreshKey] 바뀔 때 프로필 재조회 (예: 랜딩 pathname)
 * @returns {{
 *   userEmail: string,
 *   userDisplayName: string,
 *   userRoleLabel: string,
 *   onLogout: () => void
 * }}
 */
export function useAuthHeaderSession(refreshKey) {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState('')
  const [userDisplayName, setUserDisplayName] = useState('')
  const [userRoleLabel, setUserRoleLabel] = useState('')

  const syncSession = useCallback(async () => {
    if (!getAccessToken()) {
      return { email: '', displayName: '', roleLabel: '' }
    }
    try {
      const res = await getMe()
      const data = res.data?.data
      const email = String(data?.email ?? '').trim()
      const nickname = String(data?.nickname ?? '').trim()
      const username = String(data?.username ?? '').trim()
      const displayName = nickname || username || email
      const role = data?.role
      setStoredUserRole(role)
      const roleLabel = getRoleDisplayLabel(role)
      return { email, displayName, roleLabel }
    } catch {
      return { email: '', displayName: '', roleLabel: '' }
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    syncSession().then((profile) => {
      if (cancelled) return
      setUserEmail(profile.email)
      setUserDisplayName(profile.displayName)
      setUserRoleLabel(profile.roleLabel)
    })
    return () => {
      cancelled = true
    }
  }, [syncSession, refreshKey])

  const onLogout = useCallback(() => logoutAndNavigate(navigate, ROUTES.login), [navigate])

  return { userEmail, userDisplayName, userRoleLabel, onLogout }
}

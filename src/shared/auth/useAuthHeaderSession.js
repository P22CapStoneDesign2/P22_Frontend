import { useCallback, useEffect, useState } from 'react'
import { getMe } from '../../api/auth.js'
import { useLogoutWithConfirm } from './useLogoutWithConfirm.js'
import { getAccessToken } from './tokenStorage.js'
import { getRoleDisplayLabel } from './roleDisplayLabel.js'
import { setStoredUserRole } from './roleUtils.js'

/**
 * @param {unknown} [refreshKey]
 * @param {{ logoutMode?: 'api' | 'client' }} [options]
 */
export function useAuthHeaderSession(refreshKey, options = {}) {
  const { logoutMode = 'api' } = options
  const { requestLogout, logoutConfirmModal } = useLogoutWithConfirm({ mode: logoutMode })
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

  return { userEmail, userDisplayName, userRoleLabel, onLogout: requestLogout, logoutConfirmModal }
}

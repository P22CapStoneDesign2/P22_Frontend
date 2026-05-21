import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthHeaderSession } from '../../shared/auth/useAuthHeaderSession.js'
import { getAccessToken } from '../../shared/auth/tokenStorage.js'
import { ROUTES } from '../../shared/constants/routes.js'

/**
 * 랜딩 AppLayout Header — 로그인 시 이메일·로그아웃, 미로그인 시 로그인 링크.
 */
export function useLandingHeaderProps() {
  const { pathname } = useLocation()
  const { userEmail, onLogout } = useAuthHeaderSession(pathname)
  const isLoggedIn = Boolean(getAccessToken())

  return useMemo(
    () => ({
      logoImageOnly: true,
      logoHref: ROUTES.home,
      ...(isLoggedIn
        ? { userEmail, onLogout }
        : { loginHref: ROUTES.login }),
    }),
    [pathname, isLoggedIn, userEmail, onLogout],
  )
}

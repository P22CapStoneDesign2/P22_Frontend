/* 카카오(OAuth2) 콜백 처리
 * 명세: docs/API-SPEC.md §3 — 백엔드가 카카오 인증 후 분기한다.
 *  - 기존 유저: /oauth2/callback?accessToken=...&refreshToken=...  ← 이 페이지가 처리
 *  - 신규 유저: /oauth2/register?pendingToken=...&kakaoName=...     ← KakaoRegisterPage가 처리
 *
 * 즉, 이 페이지에 도착했다면 백엔드 기준 '기존 유저'이며 토큰이 반드시 함께 와야 한다.
 * 토큰이 없으면 비정상 케이스로 간주해 로그인 화면으로 되돌린다.
 */
import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getMe } from '../../api/auth'
import { dashboardRouteForRole } from '../../shared/auth/postAuthNavigation.js'
import { setStoredUserRole } from '../../shared/auth/roleUtils.js'
import { ROUTES } from '../../shared/constants/routes.js'

export default function KakaoCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  /* StrictMode에서 useEffect가 두 번 실행되더라도 처리·요청·alert가 중복되지 않도록 */
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    handledRef.current = true

    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const errorMessage = searchParams.get('error')

    if (errorMessage) {
      window.alert(decodeURIComponent(errorMessage))
      navigate(ROUTES.login, { replace: true })
      return
    }

    if (!accessToken || !refreshToken) {
      window.alert('카카오 로그인 정보를 받아오지 못했습니다.')
      navigate(ROUTES.login, { replace: true })
      return
    }

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    ;(async () => {
      try {
        const res = await getMe()
        const me = res.data?.data ?? {}
        setStoredUserRole(me.role)
        navigate(dashboardRouteForRole(me.role), { replace: true })
      } catch {
        window.alert('회원 정보를 불러오지 못했습니다. 다시 로그인해 주세요.')
        navigate(ROUTES.login, { replace: true })
      }
    })()
  }, [navigate, searchParams])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'inherit',
        color: '#334155',
      }}
    >
      카카오 로그인 처리 중입니다...
    </div>
  )
}

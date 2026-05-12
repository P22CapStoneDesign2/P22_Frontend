/* 카카오(OAuth2) 콜백 처리
 * 명세: 백엔드가 /oauth2/callback?accessToken=...&refreshToken=... 로 리다이렉트
 *
 * 명세에 isNewUser 같은 신규 가입 플래그가 없으므로,
 *  1) 토큰 저장 후 GET /api/users/me 로 회원 정보를 조회
 *  2) provider가 KAKAO이고 username(이름) 또는 nickname(닉네임)이 비어 있으면
 *     → 최초 1회 이름·닉네임 등록 화면(/oauth2/signup)
 *     그 외 → 워크스페이스
 */
import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getMe } from '../../api/auth'
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
      navigate(ROUTES.home, { replace: true })
      return
    }

    if (!accessToken || !refreshToken) {
      window.alert('카카오 로그인 정보를 받아오지 못했습니다.')
      navigate(ROUTES.home, { replace: true })
      return
    }

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    ;(async () => {
      try {
        const res = await getMe()
        const me = res.data?.data ?? {}
        const username = (me.username ?? '').trim()
        const nickname = (me.nickname ?? '').trim()
        const isKakao = String(me.provider ?? '').toUpperCase() === 'KAKAO'
        const needsKakaoProfile = isKakao && (!username || !nickname)
        if (needsKakaoProfile) {
          navigate(ROUTES.kakaoSignup, { replace: true })
        } else {
          navigate(ROUTES.workspace, { replace: true })
        }
      } catch {
        /* 회원 정보 조회 실패 시: 일단 추가 정보 입력 화면으로 보내 신규 가입 흐름을 유도 */
        navigate(ROUTES.kakaoSignup, { replace: true })
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

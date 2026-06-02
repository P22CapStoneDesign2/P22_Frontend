import { useNavigate } from 'react-router-dom'
import { getAccessToken } from '../../shared/auth/tokenStorage.js'
import { navigateAfterStart } from '../../shared/navigation/navigateAfterStart.js'

/**
 * 랜딩 CTA — 로그인 시 role별 메인, 미로그인 시 로그인 화면
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
export default function LandingStartLink({ className, children }) {
  const navigate = useNavigate()
  const isLoggedIn = Boolean(getAccessToken())

  return (
    <button
      type="button"
      className={className}
      onClick={() => navigateAfterStart(navigate, isLoggedIn)}
    >
      {children}
    </button>
  )
}

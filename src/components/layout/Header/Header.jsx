import { Link } from 'react-router-dom'
import './Header.css'

function isExternalHref(href) {
  return /^https?:\/\//i.test(href)
}

/**
 * @param {object} props
 * @param {string} props.userEmail
 * @param {() => void} props.onLogout
 * @param {string} [props.logoHref]
 * @param {string} [props.logoLabel]
 * @param {string} [props.className]
 */
export default function Header({
  userEmail,
  onLogout,
  logoHref = '/',
  logoLabel = 'EDU HUB',
  className = '',
}) {
  const logo = isExternalHref(logoHref) ? (
    <a className="edu-header__logo" href={logoHref}>
      {logoLabel}
    </a>
  ) : (
    <Link className="edu-header__logo" to={logoHref || '/'}>
      {logoLabel}
    </Link>
  )

  return (
    <header className={`edu-header ${className}`.trim()}>
      <div className="edu-header__left">{logo}</div>
      <div className="edu-header__right">
        <span className="edu-header__email" title={userEmail}>
          {userEmail}
        </span>
        <button type="button" className="edu-header__logout" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </header>
  )
}

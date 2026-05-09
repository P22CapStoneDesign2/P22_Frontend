import { Link } from 'react-router-dom'
import './Header.css'

function isExternalHref(href) {
  return /^https?:\/\//i.test(href)
}

/**
 * @typedef {{ label: string, to?: string }} BreadcrumbItem
 * @param {object} props
 * @param {string} props.userEmail
 * @param {() => void} props.onLogout
 * @param {string} [props.logoHref]
 * @param {string} [props.logoLabel]
 * @param {string} [props.className]
 * @param {BreadcrumbItem[]} [props.breadcrumbItems] 현재 경로 표시 (없거나 빈 배열이면 비표시)
 */
export default function Header({
  userEmail,
  onLogout,
  logoHref = '/',
  logoLabel = 'EDU HUB',
  className = '',
  breadcrumbItems,
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

  const showBreadcrumb = Array.isArray(breadcrumbItems) && breadcrumbItems.length > 0

  return (
    <header className={`edu-header ${className}`.trim()}>
      <div className="edu-header__inner">
        <div className="edu-header__primary">
          {logo}
          {showBreadcrumb ? (
            <nav className="edu-header__breadcrumb" aria-label="현재 위치">
              <ol className="edu-header__breadcrumb-list">
                {breadcrumbItems.map((item, i) => (
                  <li key={`${i}-${item.label}`} className="edu-header__breadcrumb-item">
                    {item.to ? (
                      <Link className="edu-header__breadcrumb-link" to={item.to}>
                        {item.label}
                      </Link>
                    ) : (
                      <span className="edu-header__breadcrumb-current" aria-current="page">
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </div>
        <div className="edu-header__right">
          <span className="edu-header__email" title={userEmail}>
            {userEmail}
          </span>
          <button type="button" className="edu-header__logout" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </header>
  )
}

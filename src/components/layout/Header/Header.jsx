import { Link } from 'react-router-dom'
import { EduHubBookIcon } from '../../../shared/icons/eduHubIcons.jsx'
import './Header.css'

function isExternalHref(href) {
  return /^https?:\/\//i.test(href)
}

function HeaderLogo({ logoHref, logoLabel, showBrandIcon, logoImageOnly }) {
  if (logoImageOnly) {
    const image = <EduHubBookIcon />
    if (isExternalHref(logoHref)) {
      return (
        <a className="edu-header__logo edu-header__logo--image" href={logoHref} aria-label="EDU HUB 홈">
          {image}
        </a>
      )
    }
    return (
      <Link className="edu-header__logo edu-header__logo--image" to={logoHref || '/'} aria-label="EDU HUB 홈">
        {image}
      </Link>
    )
  }

  if (showBrandIcon) {
    const brand = (
      <>
        <span className="edu-header__brand-text">EDU</span>
        <EduHubBookIcon />
        <span className="edu-header__brand-text">HUB</span>
      </>
    )
    if (isExternalHref(logoHref)) {
      return (
        <a className="edu-header__logo edu-header__logo--brand-icon" href={logoHref} aria-label="EDU HUB">
          {brand}
        </a>
      )
    }
    return (
      <Link className="edu-header__logo edu-header__logo--brand-icon" to={logoHref || '/'} aria-label="EDU HUB">
        {brand}
      </Link>
    )
  }

  if (isExternalHref(logoHref)) {
    return (
      <a className="edu-header__logo" href={logoHref}>
        {logoLabel}
      </a>
    )
  }
  return (
    <Link className="edu-header__logo" to={logoHref || '/'}>
      {logoLabel}
    </Link>
  )
}

/**
 * @typedef {{ label: string, to?: string }} BreadcrumbItem
 * @param {object} props
 * @param {'default' | 'public'} [props.variant] public: 로그인만 표시 (랜딩 등)
 * @param {string} [props.userEmail] variant default일 때 표시
 * @param {() => void} [props.onLogout] variant default일 때 로그아웃
 * @param {string} [props.loginHref] variant public일 때 로그인 링크
 * @param {string} [props.loginLabel]
 * @param {string} [props.logoHref]
 * @param {string} [props.logoLabel]
 * @param {boolean} [props.showBrandIcon] EDU · 아이콘 · HUB 로고 (가운데 정렬용)
 * @param {boolean} [props.logoImageOnly] eduhub_logo.png만 왼쪽에 표시
 * @param {boolean} [props.hideLogo] true면 로고 비표시
 * @param {string} [props.className]
 * @param {BreadcrumbItem[]} [props.breadcrumbItems] 현재 경로 표시 (없거나 빈 배열이면 비표시)
 * @param {boolean} [props.logoCentered] true면 로고를 상단바 가운데, 우측 액션은 오른쪽
 */
export default function Header({
  variant = 'default',
  userEmail,
  onLogout,
  loginHref = '/login',
  loginLabel = '로그인',
  logoHref = '/',
  logoLabel = 'EDU HUB',
  showBrandIcon = false,
  logoImageOnly = false,
  hideLogo = false,
  className = '',
  breadcrumbItems,
  logoCentered = false,
}) {
  const isPublic = variant === 'public'
  const showLoginLink = isPublic || Boolean(loginHref && !onLogout && !userEmail)
  const logo = hideLogo ? null : (
    <HeaderLogo
      logoHref={logoHref}
      logoLabel={logoLabel}
      showBrandIcon={showBrandIcon}
      logoImageOnly={logoImageOnly}
    />
  )

  const showBreadcrumb = Array.isArray(breadcrumbItems) && breadcrumbItems.length > 0

  return (
    <header
      className={`edu-header${isPublic ? ' edu-header--public' : ''}${logoCentered && !hideLogo ? ' edu-header--logo-centered' : ''}${hideLogo ? ' edu-header--no-logo' : ''} ${className}`.trim()}
    >
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
          {showLoginLink ? (
            <Link className="edu-header__login" to={loginHref}>
              {loginLabel}
            </Link>
          ) : (
            <>
              <span className="edu-header__email" title={userEmail}>
                {userEmail}
              </span>
              <button type="button" className="edu-header__logout" onClick={onLogout}>
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

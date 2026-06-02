import Header from '../Header/Header.jsx'
import './AppLayout.css'

/** EDU HUB 공통 레이아웃: sticky Header + 본문 영역. headerProps는 Header에 그대로 전달됩니다. */
export default function AppLayout({
  children,
  className = '',
  contentClassName = '',
  headerProps = {},
}) {
  return (
    <div className={`edu-app-layout ${className}`.trim()}>
      <Header {...headerProps} />
      <div className={`edu-app-layout__content ${contentClassName}`.trim()}>{children}</div>
    </div>
  )
}

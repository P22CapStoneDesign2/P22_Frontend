import { useNavigate } from 'react-router-dom'
import MenuCard from '../../components/ui/MenuCard/MenuCard.jsx'
import '../../components/layout/Header/Header.css'
import './DashboardPageLayout.css'

/**
 * @typedef {object} DashboardMenuItem
 * @property {string} id
 * @property {string} title
 * @property {import('react').ReactNode} icon
 * @property {string} [to] ROUTES 경로 — onClick 없을 때 navigate
 * @property {() => void} [onClick] to 대신 직접 처리 (준비 중 안내 등)
 */

/** 대시보드 메뉴 그리드 (AppLayout은 layout route 부모) */
export default function DashboardPageLayout({ menuItems, heading }) {
  const navigate = useNavigate()

  const handleItemClick = (item) => {
    if (typeof item.onClick === 'function') {
      item.onClick()
      return
    }
    if (item.to) navigate(item.to)
  }

  return (
    <div className="edu-dashboard">
      {heading ? <h1 className="edu-dashboard__heading">{heading}</h1> : null}
      <div className="edu-dashboard__grid">
        {menuItems.map((item) => (
          <MenuCard
            key={item.id}
            icon={item.icon}
            title={item.title}
            onClick={() => handleItemClick(item)}
          />
        ))}
      </div>
    </div>
  )
}

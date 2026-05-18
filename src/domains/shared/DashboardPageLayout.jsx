import { useNavigate } from 'react-router-dom'
import MenuCard from '../../components/ui/MenuCard/MenuCard.jsx'
import '../../components/layout/Header/Header.css'
import './DashboardPageLayout.css'

/**
 * @typedef {{ id: string, title: string, icon: import('react').ReactNode, to: string }} DashboardMenuItem
 */

/** 대시보드 메뉴 그리드 (AppLayout은 layout route 부모) */
export default function DashboardPageLayout({ menuItems, heading }) {
  const navigate = useNavigate()

  return (
    <div className="edu-dashboard">
      {heading ? <h1 className="edu-dashboard__heading">{heading}</h1> : null}
      <div className="edu-dashboard__grid">
        {menuItems.map((item) => (
          <MenuCard
            key={item.id}
            icon={item.icon}
            title={item.title}
            onClick={() => navigate(item.to)}
          />
        ))}
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout/AppLayout.jsx'
import MenuCard from '../../components/ui/MenuCard/MenuCard.jsx'
import './DashboardPageLayout.css'

/**
 * @typedef {{ id: string, title: string, icon: import('react').ReactNode, to: string }} DashboardMenuItem
 */

/** AppLayout + 연한 하늘색 배경 + MenuCard 그리드. menuItems를 map으로 렌더합니다. */
export default function DashboardPageLayout({ headerProps, menuItems, heading }) {
  const navigate = useNavigate()

  return (
    <AppLayout headerProps={headerProps} contentClassName="edu-dashboard-app-layout-content">
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
    </AppLayout>
  )
}

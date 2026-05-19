// 공통 껍데기 레이아웃 — 교수/학생 영역 Header + Outlet

import { Outlet, useMatches, useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout/AppLayout.jsx'
import { ROUTES } from '../shared/constants/routes.js'
import { layoutMetaFromMatches } from './layoutMetaFromMatches.js'

/** 교수 영역 layout route — AppLayout + Outlet */
export function ProfessorAreaLayout() {
  const navigate = useNavigate()
  const meta = layoutMetaFromMatches(useMatches())

  return (
    <AppLayout
      contentClassName={meta.contentClassName ?? ''}
      headerProps={{
        userEmail: 'professor@school.edu',
        onLogout: () => navigate(ROUTES.professorDashboard),
        logoHref: ROUTES.professorDashboard,
        logoLabel: 'EDU HUB',
        breadcrumbItems: meta.breadcrumbItems,
      }}
    >
      <Outlet />
    </AppLayout>
  )
}

/** 관리자 영역 layout route — AppLayout + Outlet */
export function AdminAreaLayout() {
  const navigate = useNavigate()
  const meta = layoutMetaFromMatches(useMatches())

  return (
    <AppLayout
      className="edu-app-layout--admin-fullbleed"
      contentClassName={meta.contentClassName ?? ''}
      headerProps={{
        userEmail: 'admin@school.edu',
        onLogout: () => {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          navigate(ROUTES.home, { replace: true })
        },
        logoHref: ROUTES.adminSubjectAccess,
        logoLabel: 'EDU HUB',
        logoCentered: true,
        breadcrumbItems: meta.breadcrumbItems,
      }}
    >
      <Outlet />
    </AppLayout>
  )
}

/** 학생 영역 layout route — AppLayout + Outlet */
export function StudentAreaLayout() {
  const navigate = useNavigate()
  const meta = layoutMetaFromMatches(useMatches())

  return (
    <AppLayout
      contentClassName={meta.contentClassName ?? ''}
      headerProps={{
        userEmail: 'student@school.edu',
        onLogout: () => navigate(ROUTES.studentDashboard),
        logoHref: ROUTES.studentDashboard,
        logoLabel: 'EDU HUB',
        breadcrumbItems: meta.breadcrumbItems,
      }}
    >
      <Outlet />
    </AppLayout>
  )
}

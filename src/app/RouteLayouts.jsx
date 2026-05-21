// 공통 껍데기 레이아웃 — 교수/학생 영역 Header + Outlet

import { Outlet, useLocation, useMatches } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout/AppLayout.jsx'
import { ROUTES } from '../shared/constants/routes.js'
import { useAuthHeaderSession } from '../shared/auth/useAuthHeaderSession.js'
import { layoutMetaFromMatches } from './layoutMetaFromMatches.js'

/** 교수 영역 layout route — AppLayout + Outlet */
export function ProfessorAreaLayout() {
  const { userEmail, onLogout } = useAuthHeaderSession()
  const meta = layoutMetaFromMatches(useMatches())

  return (
    <AppLayout
      contentClassName={meta.contentClassName ?? ''}
      headerProps={{
        userEmail,
        onLogout,
        logoHref: ROUTES.professorDashboard,
        logoLabel: 'EDU HUB',
        logoImageOnly: true,
        breadcrumbItems: meta.breadcrumbItems,
      }}
    >
      <Outlet />
    </AppLayout>
  )
}

/** 관리자 영역 layout route — AppLayout + Outlet */
export function AdminAreaLayout() {
  const { userEmail, onLogout } = useAuthHeaderSession()
  const meta = layoutMetaFromMatches(useMatches())

  return (
    <AppLayout
      className="edu-app-layout--admin-fullbleed"
      contentClassName={meta.contentClassName ?? ''}
      headerProps={{
        userEmail,
        onLogout,
        logoHref: ROUTES.adminSubjectAccess,
        logoLabel: 'EDU HUB',
        logoImageOnly: true,
        breadcrumbItems: meta.breadcrumbItems,
      }}
    >
      <Outlet />
    </AppLayout>
  )
}

/** 학생 영역 layout route — AppLayout + Outlet */
export function StudentAreaLayout() {
  const { userEmail, onLogout } = useAuthHeaderSession()
  const location = useLocation()
  const meta = layoutMetaFromMatches(useMatches())
  const isCourseApplyPage = location.pathname === ROUTES.studentCourseApply

  return (
    <AppLayout
      className={isCourseApplyPage ? 'edu-app-layout--fullbleed' : ''}
      contentClassName={meta.contentClassName ?? ''}
      headerProps={{
        userEmail,
        onLogout,
        logoHref: ROUTES.studentDashboard,
        logoLabel: 'EDU HUB',
        logoImageOnly: true,
        breadcrumbItems: meta.breadcrumbItems,
      }}
    >
      <Outlet />
    </AppLayout>
  )
}

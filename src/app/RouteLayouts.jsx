// 공통 껍데기 레이아웃 — 교수/학생 영역 Header + Outlet

import { Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout/AppLayout.jsx'
import { ROUTES } from '../shared/constants/routes.js'
import { logoutAndNavigate } from '../shared/auth/performLogout.js'
import { useAuthHeaderSession } from '../shared/auth/useAuthHeaderSession.js'
import PrivateRoute from '../shared/PrivateRoute.jsx'
import { layoutMetaFromMatches } from './layoutMetaFromMatches.js'

/** 교수 영역 layout route — AppLayout + Outlet */
export function ProfessorAreaLayout() {
  const meta = layoutMetaFromMatches(useMatches())
  const { userEmail, onLogout } = useAuthHeaderSession()

  return (
    <AppLayout
      className="edu-app-layout--hub"
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
      <PrivateRoute>
        <Outlet />
      </PrivateRoute>
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
        onLogout: () => logoutAndNavigate(navigate, ROUTES.home),
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
  const location = useLocation()
  const meta = layoutMetaFromMatches(useMatches())
  const isCourseApplyPage = location.pathname === ROUTES.studentCourseApply
  const { userEmail, onLogout } = useAuthHeaderSession()

  return (
    <AppLayout
      className={
        isCourseApplyPage ? 'edu-app-layout--hub edu-app-layout--fullbleed' : 'edu-app-layout--hub'
      }
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
      <PrivateRoute>
        <Outlet />
      </PrivateRoute>
    </AppLayout>
  )
}

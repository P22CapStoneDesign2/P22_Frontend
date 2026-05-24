// 공통 껍데기 레이아웃 — 교수/학생/관리자 영역 Header + Outlet

import { useCallback } from 'react'
import { Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout/AppLayout.jsx'
import { ROUTES } from '../shared/constants/routes.js'
import { useAuthHeaderSession } from '../shared/auth/useAuthHeaderSession.js'
import { createHeaderLogoutHandler } from './headerLogoutHandler.js'
import { layoutMetaFromMatches } from './layoutMetaFromMatches.js'

/** 교수 영역 layout route — AppLayout + Outlet */
export function ProfessorAreaLayout() {
  const navigate = useNavigate()
  const meta = layoutMetaFromMatches(useMatches())
  const { userEmail } = useAuthHeaderSession()
  const onLogout = useCallback(() => createHeaderLogoutHandler(navigate)(), [navigate])

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
      <Outlet />
    </AppLayout>
  )
}

/** 관리자 영역 layout route — AppLayout + Outlet */
export function AdminAreaLayout() {
  const navigate = useNavigate()
  const meta = layoutMetaFromMatches(useMatches())
  const { userEmail } = useAuthHeaderSession()
  const onLogout = useCallback(() => createHeaderLogoutHandler(navigate)(), [navigate])

  const adminNavLinks = [
    { label: '교안 수강 신청 관리', to: ROUTES.adminSubjectAccess },
    { label: '교수 가입 승인', to: ROUTES.adminProfessorSignups },
  ]

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
        navLinks: adminNavLinks,
      }}
    >
      <Outlet />
    </AppLayout>
  )
}

/** 학생 영역 layout route — AppLayout + Outlet */
export function StudentAreaLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const meta = layoutMetaFromMatches(useMatches())
  const { userEmail } = useAuthHeaderSession()
  const onLogout = useCallback(() => createHeaderLogoutHandler(navigate)(), [navigate])
  const isCourseApplyPage = location.pathname === ROUTES.studentCourseApply

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
      <Outlet />
    </AppLayout>
  )
}

// 공통 껍데기 레이아웃 — 교수/학생/관리자 영역 Header + Outlet

import { useCallback } from 'react'
import { Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout/AppLayout.jsx'
import { ROUTES } from '../shared/constants/routes.js'
import { useAuthHeaderSession } from '../shared/auth/useAuthHeaderSession.js'
import RoleAreaGuard from '../shared/auth/RoleAreaGuard.jsx'
import { createHeaderLogoutHandler } from './headerLogoutHandler.js'
import { layoutMetaFromMatches } from './layoutMetaFromMatches.js'

function useHeaderSessionProps(logoHref, extra = {}) {
  const navigate = useNavigate()
  const { userEmail, userDisplayName, userRoleLabel } = useAuthHeaderSession()
  const onLogout = useCallback(() => createHeaderLogoutHandler(navigate)(), [navigate])

  return {
    userEmail,
    userDisplayName,
    userRoleLabel,
    onLogout,
    logoHref,
    logoLabel: 'EDU HUB',
    logoImageOnly: true,
    ...extra,
  }
}

function ProfessorAreaLayoutInner() {
  const meta = layoutMetaFromMatches(useMatches())
  const headerProps = useHeaderSessionProps(ROUTES.professorDashboard, {
    breadcrumbItems: meta.breadcrumbItems,
  })

  return (
    <AppLayout
      className="edu-app-layout--hub"
      contentClassName={meta.contentClassName ?? ''}
      headerProps={headerProps}
    >
      <Outlet />
    </AppLayout>
  )
}

/** 교수 영역 layout route — AppLayout + Outlet */
export function ProfessorAreaLayout() {
  return (
    <RoleAreaGuard area="professor">
      <ProfessorAreaLayoutInner />
    </RoleAreaGuard>
  )
}

function AdminAreaLayoutInner() {
  const meta = layoutMetaFromMatches(useMatches())
  const adminNavLinks = [
    { label: '교안 수강 신청 관리', to: ROUTES.adminSubjectAccess },
    { label: '교수 가입 승인', to: ROUTES.adminProfessorSignups },
  ]
  const headerProps = useHeaderSessionProps(ROUTES.adminSubjectAccess, {
    breadcrumbItems: meta.breadcrumbItems,
    navLinks: adminNavLinks,
  })

  return (
    <AppLayout
      className="edu-app-layout--admin-fullbleed"
      contentClassName={meta.contentClassName ?? ''}
      headerProps={headerProps}
    >
      <Outlet />
    </AppLayout>
  )
}

/** 관리자 영역 layout route — AppLayout + Outlet */
export function AdminAreaLayout() {
  return (
    <RoleAreaGuard area="admin">
      <AdminAreaLayoutInner />
    </RoleAreaGuard>
  )
}

function StudentAreaLayoutInner() {
  const location = useLocation()
  const meta = layoutMetaFromMatches(useMatches())
  const isCourseApplyPage = location.pathname === ROUTES.studentCourseApply
  const headerProps = useHeaderSessionProps(ROUTES.studentDashboard, {
    breadcrumbItems: meta.breadcrumbItems,
  })

  return (
    <AppLayout
      className={
        isCourseApplyPage ? 'edu-app-layout--hub edu-app-layout--fullbleed' : 'edu-app-layout--hub'
      }
      contentClassName={meta.contentClassName ?? ''}
      headerProps={headerProps}
    >
      <Outlet />
    </AppLayout>
  )
}

/** 학생 영역 layout route — AppLayout + Outlet */
export function StudentAreaLayout() {
  return (
    <RoleAreaGuard area="student">
      <StudentAreaLayoutInner />
    </RoleAreaGuard>
  )
}

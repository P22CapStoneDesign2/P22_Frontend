// 공통 껍데기 레이아웃 — 교수/학생/관리자 영역 Header + Outlet

import { Outlet, useLocation, useMatches } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout/AppLayout.jsx'
import { ROUTES } from '../shared/constants/routes.js'
import { useAuthHeaderSession } from '../shared/auth/useAuthHeaderSession.js'
import RoleAreaGuard from '../shared/auth/RoleAreaGuard.jsx'
import { layoutMetaFromMatches } from './layoutMetaFromMatches.js'

function useHeaderSessionProps(logoHref, extra = {}) {
  const { userEmail, userDisplayName, userRoleLabel, onLogout, logoutConfirmModal } =
    useAuthHeaderSession(undefined, { logoutMode: 'client' })

  return {
    userEmail,
    userDisplayName,
    userRoleLabel,
    onLogout,
    logoutConfirmModal,
    logoHref,
    logoLabel: 'EDU HUB',
    logoImageOnly: true,
    ...extra,
  }
}

function ProfessorAreaLayoutInner() {
  const meta = layoutMetaFromMatches(useMatches())
  const { logoutConfirmModal, ...headerProps } = useHeaderSessionProps(ROUTES.professorDashboard, {
    breadcrumbItems: meta.breadcrumbItems,
  })

  return (
    <>
      {logoutConfirmModal}
      <AppLayout
      className="edu-app-layout--hub"
      contentClassName={meta.contentClassName ?? ''}
      headerProps={headerProps}
    >
      <Outlet />
    </AppLayout>
    </>
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
  const { logoutConfirmModal, ...headerProps } = useHeaderSessionProps(ROUTES.adminSubjectAccess, {
    breadcrumbItems: meta.breadcrumbItems,
    navLinks: adminNavLinks,
  })

  return (
    <>
      {logoutConfirmModal}
      <AppLayout
      className="edu-app-layout--admin-fullbleed"
      contentClassName={meta.contentClassName ?? ''}
      headerProps={headerProps}
    >
      <Outlet />
    </AppLayout>
    </>
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
  const { logoutConfirmModal, ...headerProps } = useHeaderSessionProps(ROUTES.studentDashboard, {
    breadcrumbItems: meta.breadcrumbItems,
  })

  return (
    <>
      {logoutConfirmModal}
      <AppLayout
      className={
        isCourseApplyPage ? 'edu-app-layout--hub edu-app-layout--fullbleed' : 'edu-app-layout--hub'
      }
      contentClassName={meta.contentClassName ?? ''}
      headerProps={headerProps}
    >
      <Outlet />
    </AppLayout>
    </>
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

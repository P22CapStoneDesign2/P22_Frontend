import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import QuizManagementContent from './QuizManagementContent.jsx'
import { useSessionHeader } from '../../../shared/auth/useSessionHeader.js'
import { ROUTES } from '../../../shared/constants/routes.js'
import './QuizManagementPage.css'

/**
 * 교수용 교안별 퀴즈 관리 페이지 (라우트: ROUTES.professorQuizzes)
 * Header 사용자 이메일·로그아웃은 `useSessionHeader` 훅에서 처리.
 */
export default function QuizManagementPage() {
  const { userEmail, onLogout } = useSessionHeader()

  return (
    <AppLayout
      headerProps={{
        userEmail,
        onLogout,
        logoHref: ROUTES.professorDashboard,
        logoLabel: 'EDU HUB',
        breadcrumbItems: [{ label: '교안별 퀴즈 관리' }],
      }}
      contentClassName="edu-quiz-mgmt-app-layout-content"
    >
      <QuizManagementContent />
    </AppLayout>
  )
}

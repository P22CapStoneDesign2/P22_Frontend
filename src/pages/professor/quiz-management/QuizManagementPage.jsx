import { useNavigate } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import QuizManagementContent from './QuizManagementContent.jsx'
import './QuizManagementPage.css'

/**
 * 교수용 교안별 퀴즈 관리 페이지 (라우트: /professor/quizzes)
 * AppLayout + Header 유지, 본문은 QuizManagementContent에서 mock 상태로 구성
 */
export default function QuizManagementPage() {
  const navigate = useNavigate()

  return (
    <AppLayout
      headerProps={{
        userEmail: 'professor@school.edu',
        onLogout: () => navigate('/professor'),
        logoHref: '/professor',
        logoLabel: 'EDU HUB',
        breadcrumbItems: [{ label: '교안별 퀴즈 관리' }],
      }}
      contentClassName="edu-quiz-mgmt-app-layout-content"
    >
      <QuizManagementContent />
    </AppLayout>
  )
}

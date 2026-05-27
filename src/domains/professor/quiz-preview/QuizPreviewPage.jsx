import { useParams } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import { useAuthHeaderSession } from '../../../shared/auth/useAuthHeaderSession.js'
import RoleAreaGuard from '../../../shared/auth/RoleAreaGuard.jsx'
import { ROUTES } from '../../../shared/constants/routes.js'
import PageBackButton from '../../../components/ui/PageBackButton/PageBackButton.jsx'
import QuizPreviewContent from './QuizPreviewContent.jsx'
import './QuizPreviewPage.css'

/**
 * 교수용 퀴즈 미리보기 (/professor/quizzes/:quizId/preview)
 */
function QuizPreviewPageInner() {
  const { quizId } = useParams()
  const { userEmail, userDisplayName, userRoleLabel, onLogout } = useAuthHeaderSession()

  return (
    <AppLayout
      headerProps={{
        userEmail,
        userDisplayName,
        userRoleLabel,
        onLogout,
        logoHref: ROUTES.professorDashboard,
        logoLabel: 'EDU HUB',
        logoImageOnly: true,
        breadcrumbItems: [
          { label: '교안별 퀴즈 관리', to: ROUTES.professorQuizzes },
          { label: '퀴즈 미리보기' },
        ],
      }}
      contentClassName="edu-quiz-preview-app-layout-content"
    >
      <div className="edu-quiz-preview-page">
        <PageBackButton fallbackPath={ROUTES.professorQuizzes} />
        <header className="edu-quiz-preview-page__header">
          <h1 className="edu-quiz-preview-page__title">퀴즈 미리보기</h1>
          <p className="edu-quiz-preview-page__sub">
            <span className="edu-quiz-preview-page__sub-label">시작 문항 ID</span>{' '}
            <code className="edu-quiz-preview-page__sub-code">{quizId ?? '—'}</code>
            <span className="edu-quiz-preview-page__sub-note"> — 제출·저장 없이 문항만 확인합니다.</span>
          </p>
        </header>
        <QuizPreviewContent key={quizId ?? ''} />
      </div>
    </AppLayout>
  )
}

export default function QuizPreviewPage() {
  return (
    <RoleAreaGuard area="professor">
      <QuizPreviewPageInner />
    </RoleAreaGuard>
  )
}

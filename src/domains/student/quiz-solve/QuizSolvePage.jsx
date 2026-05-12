import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import QuizSolveContent from './QuizSolveContent.jsx'
import './QuizSolvePage.css'

/**
 * 학생 퀴즈 풀이 (/student/quiz/:materialId)
 */
export default function QuizSolvePage() {
  const { materialId } = useParams()
  const navigate = useNavigate()
  const mid = materialId ?? ''

  return (
    <AppLayout
      headerProps={{
        userEmail: 'student@school.edu',
        onLogout: () => navigate('/student'),
        logoHref: '/student',
        logoLabel: 'EDU HUB',
      }}
      contentClassName="edu-quiz-solve-app-layout-content"
    >
      <div className="edu-quiz-solve-page">
        <header className="edu-quiz-solve-page__header">
          <h1 className="edu-quiz-solve-page__title">퀴즈 풀이</h1>
          <p className="edu-quiz-solve-page__meta">
            <span className="edu-quiz-solve-page__meta-label">교안 ID</span>{' '}
            <code className="edu-quiz-solve-page__meta-code">{mid || '—'}</code>
          </p>
        </header>
        <QuizSolveContent key={mid} materialId={mid} />
      </div>
    </AppLayout>
  )
}

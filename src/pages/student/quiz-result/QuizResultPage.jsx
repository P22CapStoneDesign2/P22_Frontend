import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import QuizResultContent from './QuizResultContent.jsx'
import './QuizResultPage.css'

/**
 * 학생 퀴즈 결과 페이지 (/student/quiz/result/:attemptId)
 */
export default function QuizResultPage() {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const aid = attemptId ?? ''

  return (
    <AppLayout
      headerProps={{
        userEmail: 'student@school.edu',
        onLogout: () => navigate('/student'),
        logoHref: '/student',
        logoLabel: 'EDU HUB',
      }}
      contentClassName="edu-quiz-result-app-layout-content"
    >
      <div className="edu-quiz-result-page">
        <header className="edu-quiz-result-page__header">
          <h1 className="edu-quiz-result-page__title">퀴즈 결과</h1>
          <p className="edu-quiz-result-page__meta">
            <span className="edu-quiz-result-page__meta-label">응시 ID</span>{' '}
            <code className="edu-quiz-result-page__meta-code">{aid || '—'}</code>
          </p>
        </header>
        <QuizResultContent key={aid} attemptId={aid} />
      </div>
    </AppLayout>
  )
}

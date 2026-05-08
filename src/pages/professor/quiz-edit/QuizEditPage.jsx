import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import QuizEditContent from './QuizEditContent.jsx'
import { getMockQuizEditBundle } from './mockQuizEditData.js'
import '../quiz-create/QuizCreatePage.css'

/**
 * 퀴즈 수정 라우트 셸: 제목·mock 메타 표시, 본문은 QuizEditContent → QuizEditorContent
 */
export default function QuizEditPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()

  const bundle = getMockQuizEditBundle(quizId)
  const materialId = bundle.materialId
  const initialQuestions = bundle.questions

  return (
    <AppLayout
      headerProps={{
        userEmail: 'professor@school.edu',
        onLogout: () => navigate('/professor'),
        logoHref: '/professor',
        logoLabel: 'EDU HUB',
      }}
      contentClassName="edu-quiz-create-app-layout-content"
    >
      <div className="edu-quiz-create-page">
        <header className="edu-quiz-create-page__header">
          <h1 className="edu-quiz-create-page__title">퀴즈 수정</h1>
          <p className="edu-quiz-create-page__meta">
            <span className="edu-quiz-create-page__meta-label">퀴즈 ID</span>{' '}
            <code className="edu-quiz-create-page__meta-code">{quizId ?? '—'}</code>
            <span className="edu-quiz-create-page__meta-sep" aria-hidden>
              {' · '}
            </span>
            <span className="edu-quiz-create-page__meta-label">교안 ID</span>{' '}
            <code className="edu-quiz-create-page__meta-code">{materialId}</code>
          </p>
        </header>
        <QuizEditContent
          quizId={quizId ?? ''}
          materialId={materialId}
          initialQuestions={initialQuestions}
        />
      </div>
    </AppLayout>
  )
}

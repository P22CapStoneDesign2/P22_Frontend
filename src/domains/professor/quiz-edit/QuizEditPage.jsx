import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import QuizEditContent from './QuizEditContent.jsx'
import { getQuizDetailForEdit } from '../../quiz/api/quizApi.js'
import { mapQuizDetailToEditorBundle } from '../../quiz/mappers/quizDetailMapper.js'
import { ROUTES } from '../../../shared/constants/routes.js'
import '../quiz-create/QuizCreatePage.css'

/**
 * 퀴즈 수정 라우트 셸: `GET /api/quiz/{quizId}`로 preload → QuizEditContent로 위임.
 */
export default function QuizEditPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()

  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(Boolean(quizId))
  const [errorMessage, setErrorMessage] = useState(
    quizId ? '' : '퀴즈 ID가 지정되지 않았습니다.',
  )

  useEffect(() => {
    if (!quizId) return undefined
    let alive = true
    getQuizDetailForEdit(quizId)
      .then((res) => {
        if (!alive) return
        setBundle(mapQuizDetailToEditorBundle(res.data?.data, quizId))
      })
      .catch((e) => {
        if (!alive) return
        setBundle(null)
        setErrorMessage(e?.response?.data?.message || e?.message || '퀴즈를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [quizId])

  return (
    <AppLayout
      headerProps={{
        userEmail: 'professor@school.edu',
        onLogout: () => navigate(ROUTES.professorDashboard),
        logoHref: ROUTES.professorDashboard,
        logoLabel: 'EDU HUB',
        breadcrumbItems: [
          { label: '교안별 퀴즈 관리', to: ROUTES.professorQuizzes },
          { label: '퀴즈 수정' },
        ],
      }}
      contentClassName="edu-quiz-create-app-layout-content"
    >
      <div className="edu-quiz-create-page">
        <header className="edu-quiz-create-page__header">
          <h1 className="edu-quiz-create-page__title">퀴즈 수정</h1>
          <p className="edu-quiz-create-page__meta">
            <span className="edu-quiz-create-page__meta-label">퀴즈 ID</span>{' '}
            <code className="edu-quiz-create-page__meta-code">{quizId ?? '—'}</code>
          </p>
        </header>

        {loading ? (
          <p className="edu-quiz-create-page__meta" role="status" aria-live="polite">
            퀴즈를 불러오는 중입니다…
          </p>
        ) : errorMessage ? (
          <p className="edu-quiz-editor-error" role="alert">
            {errorMessage}
          </p>
        ) : bundle ? (
          <QuizEditContent
            quizId={quizId ?? ''}
            materialId={bundle.materialId}
            initialTitle={bundle.title}
            initialDescription={bundle.description}
            initialQuestions={bundle.questions}
            initialActiveQuestionId={bundle.initialActiveQuestionId}
          />
        ) : null}
      </div>
    </AppLayout>
  )
}

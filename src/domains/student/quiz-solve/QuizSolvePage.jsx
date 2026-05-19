import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import QuizSolveContent from './QuizSolveContent.jsx'
import { getQuizDetail } from '../../quiz/api/quizApi.js'
import { mapQuizDetailToSolveBundle } from '../../quiz/mappers/quizDetailMapper.js'
import { ROUTES } from '../../../shared/constants/routes.js'
import './QuizSolvePage.css'

/**
 * 학생 퀴즈 풀이 (ROUTES.studentQuizSolve, `:quizId`)
 */
export default function QuizSolvePage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const qid = quizId ?? ''

  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(Boolean(qid))
  const [errorMessage, setErrorMessage] = useState(
    qid ? '' : '퀴즈 ID가 지정되지 않았습니다.',
  )

  useEffect(() => {
    if (!qid) return undefined
    let alive = true
    getQuizDetail(qid)
      .then((res) => {
        if (!alive) return
        setBundle(mapQuizDetailToSolveBundle(res.data?.data, qid))
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
  }, [qid])

  return (
    <AppLayout
      headerProps={{
        userEmail: 'student@school.edu',
        onLogout: () => navigate(ROUTES.studentDashboard),
        logoHref: ROUTES.studentDashboard,
        logoLabel: 'EDU HUB',
      }}
      contentClassName="edu-quiz-solve-app-layout-content"
    >
      <div className="edu-quiz-solve-page">
        <header className="edu-quiz-solve-page__header">
          <h1 className="edu-quiz-solve-page__title">
            {bundle?.title?.trim() ? bundle.title : '퀴즈 풀이'}
          </h1>
          <p className="edu-quiz-solve-page__meta">
            <span className="edu-quiz-solve-page__meta-label">퀴즈 ID</span>{' '}
            <code className="edu-quiz-solve-page__meta-code">{qid || '—'}</code>
          </p>
        </header>

        {loading ? (
          <p className="edu-quiz-solve-page__meta" role="status" aria-live="polite">
            퀴즈를 불러오는 중입니다…
          </p>
        ) : errorMessage ? (
          <p className="edu-quiz-solve-page__meta edu-quiz-solve-page__meta--error" role="alert">
            {errorMessage}
          </p>
        ) : bundle ? (
          <QuizSolveContent
            key={qid}
            quizId={qid}
            materialId={bundle.materialId}
            questions={bundle.questions}
          />
        ) : null}
      </div>
    </AppLayout>
  )
}

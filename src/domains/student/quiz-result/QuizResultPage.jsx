import { useNavigate, useLocation, useParams } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import QuizResultContent from './QuizResultContent.jsx'
import { ROUTES } from '../../../shared/constants/routes.js'
import './QuizResultPage.css'

/**
 * 학생 퀴즈 결과 페이지 (ROUTES.studentQuizResult, `:attemptId`)
 *
 * 풀이 화면에서 `navigate(..., { state })`로 전달받는 location state:
 * - `submitResponse`: `submitQuiz` 응답의 `data` (`submissionId`, `answers[]` 등)
 * - `questionEnrichmentById`: 객관식 보기 매칭용 (`buildQuestionEnrichmentByIdFromSolveQuestions`)
 * - `materialId`: PDF placeholder 표시용 (선택)
 *
 * state가 없으면(예: 새로고침·직접 URL 입력) fallback 안내를 띄운다.
 */
export default function QuizResultPage() {
  const { attemptId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const aid = attemptId ?? ''

  const state = location.state ?? null
  const submitResponse = state?.submitResponse ?? null

  return (
    <AppLayout
      headerProps={{
        userEmail: 'student@school.edu',
        onLogout: () => navigate(ROUTES.studentDashboard),
        logoHref: ROUTES.studentDashboard,
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

        {submitResponse ? (
          <QuizResultContent
            key={aid}
            attemptId={aid}
            submitResponse={submitResponse}
            questionEnrichmentById={state?.questionEnrichmentById ?? null}
            materialId={state?.materialId ?? ''}
          />
        ) : (
          <p className="edu-quiz-result-page__meta" role="alert">
            결과 데이터를 찾을 수 없습니다. 퀴즈 풀이 화면에서 제출하면 결과가 표시됩니다.
          </p>
        )}
      </div>
    </AppLayout>
  )
}

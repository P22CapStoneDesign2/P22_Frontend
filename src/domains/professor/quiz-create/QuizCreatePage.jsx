import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import PageBackButton from '../../../components/ui/PageBackButton/PageBackButton.jsx'
import { ROUTES } from '../../../shared/constants/routes.js'
import QuizCreateContent from './QuizCreateContent.jsx'
import { resolveQuizCreateLessonId } from './resolveQuizCreateLessonId.js'
import { useMaterialDisplayTitle } from '../../catalog/useMaterialDisplayTitle.js'
import { useIsViewerMode } from '../../../shared/auth/useUserRole.js'
import './QuizCreatePage.css'

export default function QuizCreatePage() {
  const { materialId: materialIdParam } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { isViewerMode } = useIsViewerMode()
  const materialId = resolveQuizCreateLessonId({
    materialIdParam,
    searchParams,
    locationState: location.state,
  })
  const lessonId = String(location.state?.courseId ?? '').trim()
  const materialLabel = useMaterialDisplayTitle(lessonId, materialId)
  const displayNumberOffset = Number(location.state?.displayNumberOffset ?? 0) || 0

  return (
    <div className="edu-quiz-create-page">
      <header className="edu-quiz-create-page__header">
        <h1 className="edu-quiz-create-page__title">{isViewerMode ? '퀴즈 보기' : '퀴즈 추가'}</h1>
        <PageBackButton fallbackPath={ROUTES.professorQuizzes} />
        <p className="edu-quiz-create-page__meta">
          <span className="edu-quiz-create-page__meta-label">교안</span>{' '}
          <span className="edu-quiz-create-page__meta-v">{materialLabel}</span>
        </p>
      </header>
      <QuizCreateContent materialId={materialId} displayNumberOffset={displayNumberOffset} />
    </div>
  )
}

import { useLocation, useParams, useSearchParams } from 'react-router-dom'
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
  const lessonId = resolveQuizCreateLessonId({
    materialIdParam,
    searchParams,
    locationState: location.state,
  })
  // lessonId = 교안(lesson) ID. mid 등 미선언 별칭 사용 금지(ReferenceError 방지).
  const materialLabel = useMaterialDisplayTitle(lessonId)
  const displayNumberOffset = Number(location.state?.displayNumberOffset ?? 0) || 0

  return (
    <div className="edu-quiz-create-page">
      <header className="edu-quiz-create-page__header">
        <h1 className="edu-quiz-create-page__title">{isViewerMode ? '퀴즈 보기' : '퀴즈 생성'}</h1>
        <p className="edu-quiz-create-page__meta">
          <span className="edu-quiz-create-page__meta-label">교안</span>{' '}
          <span className="edu-quiz-create-page__meta-v">{materialLabel}</span>
        </p>
      </header>
      <QuizCreateContent lessonId={lessonId} displayNumberOffset={displayNumberOffset} />
    </div>
  )
}

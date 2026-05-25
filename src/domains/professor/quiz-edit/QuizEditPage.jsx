import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import QuizEditContent from './QuizEditContent.jsx'
import { fetchProfessorQuizEditBundle } from '../../catalog/quizCatalogService.js'
import { useMaterialDisplayTitle } from '../../catalog/useMaterialDisplayTitle.js'
import { useIsViewerMode } from '../../../shared/auth/useUserRole.js'
import '../quiz-create/QuizCreatePage.css'

export default function QuizEditPage() {
  const { quizId } = useParams()
  const location = useLocation()
  const { isViewerMode } = useIsViewerMode()

  const focusQuestionId = location.state?.initialActiveQuestionId ?? null
  const materialId =
    location.state?.materialId ??
    location.state?.selectedMaterialId ??
    ''

  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(quizId))

  useEffect(() => {
    if (!quizId) return
    let cancelled = false
    fetchProfessorQuizEditBundle(quizId, quizId, focusQuestionId).then((b) => {
      if (cancelled) return
      setBundle(b)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [quizId, focusQuestionId])

  const lessonIdForLabel =
    bundle?.lessonId || materialId || location.state?.lessonId || ''
  const fetchedLabel = useMaterialDisplayTitle(lessonIdForLabel)
  const displayMaterialLabel = lessonIdForLabel ? fetchedLabel : '—'

  if (loading) {
    return (
      <div className="edu-quiz-create-page">
        <p className="edu-quiz-create-page__meta" role="status">
          퀴즈를 불러오는 중…
        </p>
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="edu-quiz-create-page">
        <p className="edu-quiz-create-page__meta" role="status">
          퀴즈를 불러오지 못했습니다.
        </p>
      </div>
    )
  }

  if (bundle.questions.length === 0) {
    return (
      <div className="edu-quiz-create-page">
        <header className="edu-quiz-create-page__header">
          <h1 className="edu-quiz-create-page__title">{isViewerMode ? '퀴즈 보기' : '퀴즈 수정'}</h1>
          <p className="edu-quiz-create-page__meta">
            <span className="edu-quiz-create-page__meta-label">교안</span>{' '}
            <span className="edu-quiz-create-page__meta-v">{displayMaterialLabel}</span>
          </p>
        </header>
        <p className="edu-quiz-create-page__meta" role="status">
          등록된 문항이 없습니다.
        </p>
      </div>
    )
  }

  const resolvedLessonId =
    bundle.lessonId || lessonIdForLabel || location.state?.lessonId || ''

  return (
    <div className="edu-quiz-create-page">
      <header className="edu-quiz-create-page__header">
        <h1 className="edu-quiz-create-page__title">{isViewerMode ? '퀴즈 보기' : '퀴즈 수정'}</h1>
        <p className="edu-quiz-create-page__meta">
          <span className="edu-quiz-create-page__meta-label">교안</span>{' '}
          <span className="edu-quiz-create-page__meta-v">{displayMaterialLabel}</span>
        </p>
      </header>
      <QuizEditContent
        quizId={quizId ?? ''}
        materialId={resolvedLessonId}
        initialQuestions={bundle.questions}
        initialActiveQuestionId={bundle.initialActiveQuestionId}
        initialPersistedQuestionIds={bundle.persistedQuestionIds}
        primaryQuizSetId={bundle.primaryQuizSetId}
      />
    </div>
  )
}

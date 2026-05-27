import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import PageBackButton from '../../../components/ui/PageBackButton/PageBackButton.jsx'
import { ROUTES } from '../../../shared/constants/routes.js'
import QuizEditContent from './QuizEditContent.jsx'
import { fetchProfessorQuizEditBundle } from '../../catalog/quizCatalogService.js'
import { fetchMaterialTitle } from '../../catalog/lessonCatalogService.js'
import { useQuizDisplayTitle } from '../../catalog/useQuizDisplayTitle.js'
import { useIsViewerMode } from '../../../shared/auth/useUserRole.js'
import '../quiz-create/QuizCreatePage.css'

export default function QuizEditPage() {
  const { quizId } = useParams()
  const location = useLocation()
  const { isViewerMode } = useIsViewerMode()

  const focusQuestionId = location.state?.initialActiveQuestionId ?? null
  const lessonIdFromState = String(location.state?.courseId ?? location.state?.lessonId ?? '').trim()
  const materialIdFromState = String(
    location.state?.materialId ?? location.state?.selectedMaterialId ?? '',
  ).trim()

  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(quizId))
  const [materialTitle, setMaterialTitle] = useState('')

  const quizTitleFromApi = useQuizDisplayTitle(quizId, { forEdit: true })

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

  const materialId = String(bundle?.materialId ?? materialIdFromState ?? '').trim()
  const lessonId = lessonIdFromState

  useEffect(() => {
    if (!lessonId || !materialId) return
    let cancelled = false
    ;(async () => {
      const title = await fetchMaterialTitle(lessonId, materialId)
      if (!cancelled) setMaterialTitle(title)
    })()
    return () => {
      cancelled = true
    }
  }, [lessonId, materialId])

  const displayMaterialLabel = useMemo(() => {
    if (materialTitle && materialTitle !== '—') return materialTitle
    if (bundle?.quizTitle) return bundle.quizTitle
    return quizTitleFromApi
  }, [materialTitle, bundle?.quizTitle, quizTitleFromApi])

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
          <PageBackButton fallbackPath={ROUTES.professorQuizzes} />
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

  return (
    <div className="edu-quiz-create-page">
      <PageBackButton fallbackPath={ROUTES.professorQuizzes} />
      <header className="edu-quiz-create-page__header">
        <h1 className="edu-quiz-create-page__title">{isViewerMode ? '퀴즈 보기' : '퀴즈 수정'}</h1>
        <p className="edu-quiz-create-page__meta">
          <span className="edu-quiz-create-page__meta-label">교안</span>{' '}
          <span className="edu-quiz-create-page__meta-v">{displayMaterialLabel}</span>
        </p>
      </header>
      <QuizEditContent
        quizId={quizId ?? ''}
        materialId={materialId}
        initialQuestions={bundle.questions}
        initialActiveQuestionId={bundle.initialActiveQuestionId}
        initialPersistedQuestionIds={bundle.persistedQuestionIds}
        primaryQuizSetId={bundle.primaryQuizSetId}
      />
    </div>
  )
}

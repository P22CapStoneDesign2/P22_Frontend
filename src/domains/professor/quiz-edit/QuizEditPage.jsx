import { useLocation, useParams } from 'react-router-dom'
import QuizEditContent from './QuizEditContent.jsx'
import { getMockQuizEditBundle } from './mockQuizEditData.js'
import { getMaterialIdForQuizSet } from '../../quiz/storage/professorQuizzesStorage.js'
import { getMaterialDisplayLabel } from '../materials/professorMaterialsStorage.js'
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
    getMaterialIdForQuizSet(quizId) ??
    ''

  const bundle = getMockQuizEditBundle(quizId, focusQuestionId, materialId)
  const resolvedMaterialId = bundle.materialId || materialId
  const materialLabel = getMaterialDisplayLabel(resolvedMaterialId)

  return (
    <div className="edu-quiz-create-page">
      <header className="edu-quiz-create-page__header">
        <h1 className="edu-quiz-create-page__title">{isViewerMode ? '퀴즈 보기' : '퀴즈 수정'}</h1>
        <p className="edu-quiz-create-page__meta">
          <span className="edu-quiz-create-page__meta-label">교안</span>{' '}
          <span className="edu-quiz-create-page__meta-v">{materialLabel}</span>
        </p>
      </header>
      <QuizEditContent
        quizId={quizId ?? ''}
        materialId={bundle.materialId || materialId}
        initialQuestions={bundle.questions}
        initialActiveQuestionId={bundle.initialActiveQuestionId}
        initialPersistedQuestionIds={bundle.persistedQuestionIds}
        primaryQuizSetId={bundle.primaryQuizSetId}
      />
    </div>
  )
}

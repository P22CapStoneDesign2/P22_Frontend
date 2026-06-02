import { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import PageBackButton from '../../../components/ui/PageBackButton/PageBackButton.jsx'
import { ROUTES } from '../../../shared/constants/routes.js'
import { useQuizDisplayTitle } from '../../catalog/useQuizDisplayTitle.js'
import { loadStudentQuizAttemptByQuizId } from '../quiz/studentQuizData.js'
import QuizSolveContent from './QuizSolveContent.jsx'
import { tryNavigateToStoredQuizResult } from './studentQuizSubmitFlow.js'
import './QuizSolvePage.css'

const ALREADY_SUBMITTED_REDIRECT_MESSAGE =
  '이미 제출한 퀴즈입니다. 결과와 해설 페이지로 이동합니다.'

const STORED_RESULT_UNAVAILABLE_MESSAGE =
  '이미 제출한 퀴즈입니다. 결과 조회 API가 없어 해설을 불러올 수 없습니다.'

/**
 * 라우트 `quiz/:materialId` — 슬롯 이름은 legacy, 값은 quizId.
 */
export default function QuizSolvePage() {
  const navigate = useNavigate()
  const { materialId: quizIdParam } = useParams()
  const quizId = quizIdParam ?? ''
  const displayLabel = useQuizDisplayTitle(quizId)

  const hasStoredResult = useMemo(() => {
    if (!quizId.trim()) return false
    const stored = loadStudentQuizAttemptByQuizId(quizId)
    return Boolean(stored?.questions?.length)
  }, [quizId])

  const handleConfirmStoredResultRedirect = useCallback(() => {
    if (!tryNavigateToStoredQuizResult(quizId, navigate)) {
      window.alert(STORED_RESULT_UNAVAILABLE_MESSAGE)
    }
  }, [quizId, navigate])

  if (hasStoredResult) {
    return (
      <>
        <ConfirmModal
        isOpen
        message={ALREADY_SUBMITTED_REDIRECT_MESSAGE}
        confirmText="확인"
        onConfirm={handleConfirmStoredResultRedirect}
        onCancel={() => navigate(ROUTES.studentQuizMaterials)}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />
        <PageBackButton fallbackPath={ROUTES.studentQuizMaterials} />
      </>
    )
  }

  return (
    <div className="edu-quiz-solve-page">
      <PageBackButton fallbackPath={ROUTES.studentQuizMaterials} />
      <header className="edu-quiz-solve-page__header">
        <h1 className="edu-quiz-solve-page__title">퀴즈 풀이</h1>
        <p className="edu-quiz-solve-page__meta">
          <span className="edu-quiz-solve-page__meta-label">교안</span>{' '}
          <span className="edu-quiz-solve-page__meta-value">{displayLabel || '—'}</span>
        </p>
      </header>
      <QuizSolveContent quizId={quizId} />
    </div>
  )
}

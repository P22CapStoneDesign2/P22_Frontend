import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import PdfViewerSection from '../../../components/media/PdfViewerSection/PdfViewerSection.jsx'
import { getMaterialDisplayLabel } from '../../professor/materials/professorMaterialsStorage.js'
import { ROUTES } from '../../../shared/constants/routes.js'
import { loadStudentQuizAttempt } from '../quiz/studentQuizData.js'
import QuestionResultNavigator from './QuestionResultNavigator.jsx'
import ResultContent from './ResultContent.jsx'

/**
 * 퀴즈 결과/해설 본문 (교수 저장 퀴즈 + 학생 제출 답 기준 채점)
 */
export default function QuizResultContent({ attemptId }) {
  const navigate = useNavigate()
  const location = useLocation()

  const resultBundle = useMemo(() => {
    const fromState = location.state?.resultBundle
    if (fromState?.attemptId === attemptId && Array.isArray(fromState.questions)) {
      return fromState
    }
    return loadStudentQuizAttempt(attemptId)
  }, [attemptId, location.state])

  const [resultQuestions] = useState(() => resultBundle?.questions ?? [])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)

  const materialId = resultBundle?.materialId ?? ''
  const materialLabel = getMaterialDisplayLabel(materialId)

  const total = resultQuestions.length
  const currentQuestion = total > 0 ? resultQuestions[currentQuestionIndex] : null

  const isPrevDisabled = currentQuestionIndex <= 0 || total === 0
  const isNextDisabled = currentQuestionIndex >= total - 1 || total === 0

  const handlePrev = () => {
    setCurrentQuestionIndex((i) => Math.max(0, i - 1))
  }

  const handleNext = () => {
    setCurrentQuestionIndex((i) => Math.min(total - 1, i + 1))
  }

  const handleOpenExitModal = () => {
    setIsExitModalOpen(true)
  }

  const handleConfirmExit = () => {
    setIsExitModalOpen(false)
    navigate(ROUTES.studentDashboard)
  }

  const handleCancelExit = () => {
    setIsExitModalOpen(false)
  }

  if (!resultBundle || total === 0) {
    return (
      <div className="edu-quiz-result-layout edu-quiz-result-layout--empty">
        <p className="edu-quiz-result-layout__empty-msg" role="status">
          퀴즈 결과를 찾을 수 없습니다. 퀴즈를 다시 풀어 주세요.
        </p>
        <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.studentQuizMaterials)}>
          퀴즈 선택으로 이동
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="edu-quiz-result-layout">
        <section className="edu-quiz-result-layout__pdf">
          <PdfViewerSection
            className="edu-pdf-section--quiz-result"
            placeholderText={`교안: ${materialLabel}`}
          />
        </section>

        <section className="edu-quiz-result-layout__result-card" aria-label="퀴즈 결과 카드">
          <div className="edu-quiz-result-layout__result-grid">
            <aside className="edu-quiz-result-layout__nav">
              <QuestionResultNavigator
                resultQuestions={resultQuestions}
                currentQuestionIndex={currentQuestionIndex}
                onSelectQuestionIndex={setCurrentQuestionIndex}
              />
            </aside>
            <div className="edu-quiz-result-layout__detail">
              <ResultContent
                question={currentQuestion}
                onPrev={handlePrev}
                onNext={handleNext}
                onExit={handleOpenExitModal}
                isPrevDisabled={isPrevDisabled}
                isNextDisabled={isNextDisabled}
              />
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={isExitModalOpen}
        message="나가시겠습니까?"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </>
  )
}

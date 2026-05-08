import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import PdfViewerSection from '../../../components/media/PdfViewerSection/PdfViewerSection.jsx'
import QuestionResultNavigator from './QuestionResultNavigator.jsx'
import ResultContent from './ResultContent.jsx'
import { getQuizResultByAttemptId } from './quizResultMock.js'

/**
 * 퀴즈 결과/해설 본문.
 * 상태: resultQuestions / currentQuestionIndex / isExitModalOpen
 */
export default function QuizResultContent({ attemptId }) {
  const navigate = useNavigate()

  const [resultBundle] = useState(() => getQuizResultByAttemptId(attemptId))
  const [resultQuestions] = useState(() => resultBundle.questions)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)

  const materialId = resultBundle.materialId

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
    navigate('/student')
  }

  const handleCancelExit = () => {
    setIsExitModalOpen(false)
  }

  return (
    <>
      <div className="edu-quiz-result-layout">
        <section className="edu-quiz-result-layout__pdf">
          <PdfViewerSection placeholderText={`교안 PDF placeholder (${materialId})`} />
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

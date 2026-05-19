import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import PdfViewerSection from '../../../components/media/PdfViewerSection/PdfViewerSection.jsx'
import QuestionResultNavigator from './QuestionResultNavigator.jsx'
import ResultContent from './ResultContent.jsx'
import { mapSubmitResponseToResultBundle } from '../../quiz/mappers/quizResultMapper.js'
import { ROUTES } from '../../../shared/constants/routes.js'

/**
 * 퀴즈 결과/해설 본문.
 *
 * `submitQuiz` 응답(`submitResponse`)을 매퍼로 결과 화면 번들로 변환한다.
 * `questionEnrichmentById`가 있으면 객관식 보기 매칭이 가능해진다 (선택).
 */
export default function QuizResultContent({
  attemptId,
  submitResponse,
  questionEnrichmentById = null,
  materialId = '',
}) {
  const navigate = useNavigate()

  const resultBundle = useMemo(
    () =>
      mapSubmitResponseToResultBundle(submitResponse, {
        attemptId,
        materialId,
        questionEnrichmentById,
      }),
    [submitResponse, attemptId, materialId, questionEnrichmentById],
  )

  const resultQuestions = resultBundle.questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)

  const total = resultQuestions.length
  const currentQuestion = total > 0 ? resultQuestions[currentQuestionIndex] : null

  const isPrevDisabled = currentQuestionIndex <= 0 || total === 0
  const isNextDisabled = currentQuestionIndex >= total - 1 || total === 0

  const handlePrev = () => setCurrentQuestionIndex((i) => Math.max(0, i - 1))
  const handleNext = () => setCurrentQuestionIndex((i) => Math.min(total - 1, i + 1))

  const handleOpenExitModal = () => setIsExitModalOpen(true)
  const handleConfirmExit = () => {
    setIsExitModalOpen(false)
    navigate(ROUTES.studentDashboard)
  }
  const handleCancelExit = () => setIsExitModalOpen(false)

  const pdfLabel = resultBundle.materialId
    ? `교안 PDF placeholder (${resultBundle.materialId})`
    : '교안 PDF placeholder'

  return (
    <>
      <div className="edu-quiz-result-layout">
        <section className="edu-quiz-result-layout__pdf">
          <PdfViewerSection placeholderText={pdfLabel} />
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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import QuestionNavigator from './QuestionNavigator.jsx'
import QuestionContent from './QuestionContent.jsx'
import QuizNavigationButtons from './QuizNavigationButtons.jsx'
import { getQuestionsForMaterial } from './quizSolveMock.js'
import { buildQuizSubmitDto } from './quizSolveSubmitDto.js'

const RESULT_PATH = '/student/quiz/result/mock-attempt-1'

/**
 * 퀴즈 풀이 본문: questions / currentQuestionIndex / answers / 제출 모달
 */
export default function QuizSolveContent({ materialId }) {
  const navigate = useNavigate()

  const [questions] = useState(() => getQuestionsForMaterial(materialId))
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

  const total = questions.length
  const currentQuestion = total > 0 ? questions[currentQuestionIndex] : null

  const handleMcSelect = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        type: 'multipleChoice',
        selectedOptionId: optionId,
      },
    }))
  }

  const handleShortChange = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        type: 'shortAnswer',
        shortAnswer: text,
      },
    }))
  }

  const goPrev = () => {
    setCurrentQuestionIndex((i) => Math.max(0, i - 1))
  }

  const goNext = () => {
    setCurrentQuestionIndex((i) => Math.min(total - 1, i + 1))
  }

  const openSubmitModal = () => {
    setIsSubmitModalOpen(true)
  }

  const handleConfirmSubmit = () => {
    const dto = buildQuizSubmitDto(materialId, questions, answers)
    console.log(dto)
    setIsSubmitModalOpen(false)
    navigate(RESULT_PATH)
  }

  const handleCancelSubmit = () => {
    setIsSubmitModalOpen(false)
  }

  const isPrevDisabled = currentQuestionIndex <= 0 || total === 0
  const isNextDisabled = currentQuestionIndex >= total - 1 || total === 0

  return (
    <>
      <div className="edu-quiz-solve-layout">
        <aside className="edu-quiz-solve-layout__aside">
          <QuestionNavigator
            questions={questions}
            answers={answers}
            currentQuestionIndex={currentQuestionIndex}
            onSelectQuestionIndex={setCurrentQuestionIndex}
          />
        </aside>
        <div className="edu-quiz-solve-layout__main">
          <div className="edu-quiz-solve-layout__card">
            <QuestionContent
              question={currentQuestion}
              answer={currentQuestion ? answers[currentQuestion.id] : undefined}
              onSelectMcOption={(optionId) =>
                currentQuestion && handleMcSelect(currentQuestion.id, optionId)
              }
              onShortAnswerChange={(text) =>
                currentQuestion && handleShortChange(currentQuestion.id, text)
              }
            />
            <QuizNavigationButtons
              onPrev={goPrev}
              onNext={goNext}
              onSubmit={openSubmitModal}
              isPrevDisabled={isPrevDisabled}
              isNextDisabled={isNextDisabled}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isSubmitModalOpen}
        message="제출하시겠습니까?"
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
      />
    </>
  )
}

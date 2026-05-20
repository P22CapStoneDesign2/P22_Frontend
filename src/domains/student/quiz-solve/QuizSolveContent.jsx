import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import {
  ROUTES,
  studentQuizResultPath,
} from '../../../shared/constants/routes.js'
import {
  buildGradedQuizAttempt,
  loadStudentSolveQuestions,
  saveStudentQuizAttempt,
} from '../quiz/studentQuizData.js'
import QuestionNavigator from './QuestionNavigator.jsx'
import QuestionContent from './QuestionContent.jsx'
import QuizNavigationButtons from './QuizNavigationButtons.jsx'
import { buildQuizSubmitDto } from './quizSolveSubmitDto.js'
import { toggleMultipleChoiceSelection } from './multipleChoiceSelectionUtils.js'

function scrollSolveToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 퀴즈 풀이 본문: 한 문제당 한 페이지, activeQuestionIndex / answers / 제출 모달
 */
export default function QuizSolveContent({ materialId }) {
  const navigate = useNavigate()
  const mainRef = useRef(null)

  const questions = useMemo(() => loadStudentSolveQuestions(materialId), [materialId])
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [mcLimitNotice, setMcLimitNotice] = useState({ questionId: null, message: '' })

  const total = questions.length
  const currentQuestion = total > 0 ? questions[activeQuestionIndex] : null
  const isLastQuestion = total > 0 && activeQuestionIndex >= total - 1

  useEffect(() => {
    scrollSolveToTop()
    mainRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [activeQuestionIndex])

  const handleMcToggle = (questionId, optionId, requiredAnswerCount) => {
    setAnswers((prev) => {
      const current = prev[questionId]
      const currentIds = Array.isArray(current?.selectedOptionIds) ? current.selectedOptionIds : []
      const maxCount = Math.max(1, requiredAnswerCount ?? 1)
      const { nextIds, blocked } = toggleMultipleChoiceSelection(currentIds, optionId, maxCount)

      if (blocked) {
        setMcLimitNotice({
          questionId,
          message: `정답은 ${maxCount}개까지 선택할 수 있습니다.`,
        })
      } else {
        setMcLimitNotice((prev) =>
          prev.questionId === questionId ? { questionId: null, message: '' } : prev,
        )
      }

      return {
        ...prev,
        [questionId]: {
          questionId,
          type: 'multipleChoice',
          selectedOptionIds: nextIds,
        },
      }
    })
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
    setActiveQuestionIndex((i) => Math.max(0, i - 1))
  }

  const goNext = () => {
    setActiveQuestionIndex((i) => Math.min(total - 1, i + 1))
  }

  const selectQuestionIndex = (index) => {
    setActiveQuestionIndex(index)
  }

  const openSubmitModal = () => {
    if (!isLastQuestion) return
    setIsSubmitModalOpen(true)
  }

  const handleConfirmSubmit = () => {
    const dto = buildQuizSubmitDto(materialId, questions, answers)
    console.log(dto)

    const graded = buildGradedQuizAttempt(materialId, answers)
    setIsSubmitModalOpen(false)

    if (!graded) {
      window.alert('등록된 퀴즈가 없습니다.')
      navigate(ROUTES.studentQuizMaterials)
      return
    }

    saveStudentQuizAttempt(graded)
    navigate(studentQuizResultPath(graded.attemptId), { state: { resultBundle: graded } })
  }

  const handleCancelSubmit = () => {
    setIsSubmitModalOpen(false)
  }

  const isPrevDisabled = activeQuestionIndex <= 0 || total === 0
  const isNextDisabled = activeQuestionIndex >= total - 1 || total === 0

  if (total === 0) {
    return (
      <div className="edu-quiz-solve-layout edu-quiz-solve-layout--empty">
        <div className="edu-quiz-solve-layout__card">
          <p className="edu-quiz-solve-layout__empty-msg" role="status">
            등록된 퀴즈가 없습니다.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(ROUTES.studentQuizMaterials)}
          >
            퀴즈 선택으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="edu-quiz-solve-layout">
        <aside className="edu-quiz-solve-layout__aside">
          <QuestionNavigator
            questions={questions}
            answers={answers}
            currentQuestionIndex={activeQuestionIndex}
            onSelectQuestionIndex={selectQuestionIndex}
          />
        </aside>
        <div className="edu-quiz-solve-layout__main" ref={mainRef}>
          <div className="edu-quiz-solve-layout__card">
            <p className="edu-quiz-solve-layout__progress" aria-live="polite">
              문제 {activeQuestionIndex + 1} / {total}
            </p>
            <QuestionContent
              question={currentQuestion}
              answer={currentQuestion ? answers[currentQuestion.id] : undefined}
              mcLimitMessage={
                mcLimitNotice.questionId === currentQuestion?.id ? mcLimitNotice.message : ''
              }
              onToggleMcOption={(optionId) =>
                currentQuestion &&
                handleMcToggle(
                  currentQuestion.id,
                  optionId,
                  currentQuestion.requiredAnswerCount,
                )
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
              isLastQuestion={isLastQuestion}
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

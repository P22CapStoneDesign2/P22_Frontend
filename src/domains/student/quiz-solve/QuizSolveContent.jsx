import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import { ROUTES } from '../../../shared/constants/routes.js'
import { fetchStudentSolveSessionByQuizId, fetchSubmitQuizData } from '../../catalog/quizCatalogService.js'
import { mapSolveStateToSubmitRequest } from '../../quiz/mappers/quizSubmitMapper.js'
import QuestionNavigator from './QuestionNavigator.jsx'
import QuestionContent from './QuestionContent.jsx'
import QuizNavigationButtons from './QuizNavigationButtons.jsx'
import { buildQuizSubmitDto } from './quizSolveSubmitDto.js'
import { toggleMultipleChoiceSelection } from './multipleChoiceSelectionUtils.js'
import { useToast } from '../../../components/ui/Toast/useToast.js'
import { TOAST_MESSAGES } from '../../../shared/feedback/toastMessages.js'
import {
  buildResultBundleFromSubmitResponse,
  getQuizSubmitErrorMessage,
  handleQuizAlreadySubmittedError,
  navigateToQuizResult,
} from './studentQuizSubmitFlow.js'

function scrollSolveToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** @param {{ quizId: string }} props — 라우트 `quiz/:materialId` 슬롯 값 = quizId */
export default function QuizSolveContent({ quizId: quizIdFromRoute }) {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const mainRef = useRef(null)

  const [questions, setQuestions] = useState([])
  const [quizId, setQuizId] = useState('')
  const [loadedQuizKey, setLoadedQuizKey] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [mcLimitNotice, setMcLimitNotice] = useState({ questionId: null, message: '' })

  const loadKey = quizIdFromRoute
  const sessionLoading = Boolean(loadKey.trim()) && loadedQuizKey !== loadKey

  useEffect(() => {
    let cancelled = false
    if (!loadKey.trim()) return
    fetchStudentSolveSessionByQuizId(loadKey).then((session) => {
      if (cancelled) return
      if (session) {
        setQuestions(session.questions)
        setQuizId(session.quizId)
      } else {
        setQuestions([])
        setQuizId('')
      }
      setLoadedQuizKey(loadKey)
    })
    return () => {
      cancelled = true
    }
  }, [loadKey])

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
        setMcLimitNotice((prevNotice) =>
          prevNotice.questionId === questionId ? { questionId: null, message: '' } : prevNotice,
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

  const handleConfirmSubmit = async () => {
    if (submitting || !quizId) return

    buildQuizSubmitDto(quizId, questions, answers)

    setSubmitting(true)
    try {
      const payload = mapSolveStateToSubmitRequest(questions, answers)
      const apiData = await fetchSubmitQuizData(quizId, payload)
      const graded = buildResultBundleFromSubmitResponse(apiData, quizId, questions)
      setIsSubmitModalOpen(false)
      showToast(TOAST_MESSAGES.quizSubmitted)
      navigateToQuizResult(navigate, graded)
    } catch (err) {
      setIsSubmitModalOpen(false)
      if (handleQuizAlreadySubmittedError(err, quizId, questions, navigate)) {
        return
      }
      window.alert(getQuizSubmitErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelSubmit = () => {
    if (submitting) return
    setIsSubmitModalOpen(false)
  }

  const isPrevDisabled = activeQuestionIndex <= 0 || total === 0
  const isNextDisabled = activeQuestionIndex >= total - 1 || total === 0

  if (!quizIdFromRoute.trim()) {
    return (
      <div className="edu-quiz-solve-layout edu-quiz-solve-layout--empty">
        <div className="edu-quiz-solve-layout__card">
          <p className="edu-quiz-solve-layout__empty-msg" role="status">
            퀴즈 정보가 없습니다. 퀴즈 선택 화면에서 다시 시작해 주세요.
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

  if (sessionLoading) {
    return (
      <div className="edu-quiz-solve-layout edu-quiz-solve-layout--empty">
        <div className="edu-quiz-solve-layout__card">
          <p className="edu-quiz-solve-layout__empty-msg" role="status">
            퀴즈를 불러오는 중…
          </p>
        </div>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="edu-quiz-solve-layout edu-quiz-solve-layout--empty">
        <div className="edu-quiz-solve-layout__card">
          <p className="edu-quiz-solve-layout__empty-msg" role="status">
            등록된 문항이 없습니다.
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
              readOnly={false}
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
              submitLabel="제출"
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

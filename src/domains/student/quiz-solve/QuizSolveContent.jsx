import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import QuestionNavigator from './QuestionNavigator.jsx'
import QuestionContent from './QuestionContent.jsx'
import QuizNavigationButtons from './QuizNavigationButtons.jsx'
import { submitQuiz } from '../../quiz/api/quizApi.js'
import { mapSolveStateToSubmitRequest } from '../../quiz/mappers/quizSubmitMapper.js'
import { buildQuestionEnrichmentByIdFromSolveQuestions } from '../../quiz/mappers/quizResultMapper.js'
import { studentQuizResultPath } from '../../../shared/constants/routes.js'

/**
 * 퀴즈 풀이 본문 — 상위에서 quizId·questions를 받아 답안 입력·제출만 담당한다.
 *
 * 제출 시: `submitQuiz` 호출 → 응답을 결과 화면 location state로 전달 → 결과 라우트로 이동.
 * 새로고침 시 상태가 사라지므로 결과 화면은 fallback 에러를 노출한다.
 */
export default function QuizSolveContent({ quizId, materialId = '', questions }) {
  const navigate = useNavigate()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const total = questions.length
  const currentQuestion = total > 0 ? questions[currentQuestionIndex] : null

  const handleMcSelect = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, type: 'multipleChoice', selectedOptionId: optionId },
    }))
  }

  const handleShortChange = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, type: 'shortAnswer', shortAnswer: text },
    }))
  }

  const goPrev = () => setCurrentQuestionIndex((i) => Math.max(0, i - 1))
  const goNext = () => setCurrentQuestionIndex((i) => Math.min(total - 1, i + 1))

  const openSubmitModal = () => {
    if (submitting) return
    setSubmitError('')
    setIsSubmitModalOpen(true)
  }

  const handleConfirmSubmit = async () => {
    setIsSubmitModalOpen(false)
    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = mapSolveStateToSubmitRequest(questions, answers)
      const res = await submitQuiz(quizId, payload)
      const apiData = res?.data?.data
      const submissionId = apiData?.submissionId
      if (submissionId == null) {
        throw new Error('서버가 제출 ID를 반환하지 않았습니다.')
      }
      navigate(studentQuizResultPath(submissionId), {
        state: {
          submitResponse: apiData,
          questionEnrichmentById: buildQuestionEnrichmentByIdFromSolveQuestions(questions),
          materialId,
        },
        replace: true,
      })
    } catch (e) {
      setSubmitError(e?.response?.data?.message || e?.message || '퀴즈 제출에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelSubmit = () => {
    if (submitting) return
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
            {submitError ? (
              <p className="edu-quiz-solve-error" role="alert">
                {submitError}
              </p>
            ) : null}
            <QuizNavigationButtons
              onPrev={goPrev}
              onNext={goNext}
              onSubmit={openSubmitModal}
              isPrevDisabled={isPrevDisabled || submitting}
              isNextDisabled={isNextDisabled || submitting}
              isSubmitDisabled={submitting || total === 0}
              submitLabel={submitting ? '제출 중…' : undefined}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isSubmitModalOpen}
        message="제출하시겠습니까?"
        isConfirmLoading={submitting}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
      />
    </>
  )
}

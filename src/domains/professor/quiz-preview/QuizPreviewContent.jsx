import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../../shared/constants/routes.js'
import {
  getMockMaterialDisplayMeta,
  getMockQuizEditBundle,
} from '../quiz-edit/mockQuizEditData.js'
import PreviewQuestionNavigator from './PreviewQuestionNavigator.jsx'
import PreviewQuestionContent from './PreviewQuestionContent.jsx'
import PreviewNavigationButtons from './PreviewNavigationButtons.jsx'
import './QuizPreviewPage.css'

function resolveInitialIndex(questions, initialActiveQuestionId) {
  const idx = questions.findIndex((q) => q.id === initialActiveQuestionId)
  return idx >= 0 ? idx : 0
}

/**
 * 교수 퀴즈 미리보기 본문 — 수정 mock과 동일 번들, viewer 전용 (답안 상위 상태 없음)
 */
export default function QuizPreviewContent() {
  const { quizId } = useParams()
  const navigate = useNavigate()

  const bundle = useMemo(() => getMockQuizEditBundle(quizId), [quizId])
  const displayMeta = useMemo(() => getMockMaterialDisplayMeta(bundle.materialId), [bundle.materialId])

  const [questions] = useState(bundle.questions)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() =>
    resolveInitialIndex(bundle.questions, bundle.initialActiveQuestionId),
  )

  const total = questions.length
  const currentQuestion = total > 0 ? questions[currentQuestionIndex] : null
  const questionNumber = currentQuestionIndex + 1

  const goPrev = () => {
    setCurrentQuestionIndex((i) => Math.max(0, i - 1))
  }

  const goNext = () => {
    setCurrentQuestionIndex((i) => Math.min(total - 1, i + 1))
  }

  const handleExit = () => {
    navigate(ROUTES.professorQuizzes)
  }

  const isPrevDisabled = currentQuestionIndex <= 0 || total === 0
  const isNextDisabled = currentQuestionIndex >= total - 1 || total === 0

  return (
    <>
      <header className="edu-quiz-preview-page__meta-bar" role="status">
        <div className="edu-quiz-preview-page__meta-row">
          <span className="edu-quiz-preview-page__meta-item">
            <span className="edu-quiz-preview-page__meta-k">강의</span>{' '}
            <span className="edu-quiz-preview-page__meta-v">{displayMeta.courseLabel}</span>
          </span>
          <span className="edu-quiz-preview-page__meta-sep" aria-hidden>
            ·
          </span>
          <span className="edu-quiz-preview-page__meta-item">
            <span className="edu-quiz-preview-page__meta-k">교안</span>{' '}
            <span className="edu-quiz-preview-page__meta-v">{displayMeta.materialLabel}</span>
          </span>
          <span className="edu-quiz-preview-page__meta-sep" aria-hidden>
            ·
          </span>
          <span className="edu-quiz-preview-page__meta-item">
            <span className="edu-quiz-preview-page__meta-k">문제</span>{' '}
            <span className="edu-quiz-preview-page__meta-v">
              {total > 0 ? `${questionNumber} / ${total}` : '—'}
            </span>
          </span>
        </div>
      </header>

      {total === 0 ? (
        <p className="edu-quiz-preview-page__empty">표시할 문제가 없습니다.</p>
      ) : (
        <div className="edu-quiz-preview-layout">
          <aside className="edu-quiz-preview-layout__aside">
            <PreviewQuestionNavigator
              total={total}
              currentQuestionIndex={currentQuestionIndex}
              onSelectQuestionIndex={setCurrentQuestionIndex}
            />
          </aside>
          <div className="edu-quiz-preview-layout__main">
            <div className="edu-quiz-preview-layout__card">
              <PreviewQuestionContent question={currentQuestion} questionNumber={questionNumber} />
              <PreviewNavigationButtons
                onPrev={goPrev}
                onNext={goNext}
                onExit={handleExit}
                isPrevDisabled={isPrevDisabled}
                isNextDisabled={isNextDisabled}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

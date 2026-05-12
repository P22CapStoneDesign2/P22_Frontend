import { getAnswerSummaryLabel } from './quizSolveAnswerSummary.js'
import './QuestionNavigator.css'

/**
 * 학생 퀴즈 풀이 — 왼쪽 문제 목록 + 답 요약 (sticky)
 */
export default function QuestionNavigator({
  questions,
  answers,
  currentQuestionIndex,
  onSelectQuestionIndex,
}) {
  return (
    <nav className="edu-quiz-solve-qnav" aria-label="문제 번호">
      <p className="edu-quiz-solve-qnav__title">문제 목록</p>
      <div className="edu-quiz-solve-qnav__list">
        {questions.map((q, index) => {
          const summary = getAnswerSummaryLabel(q, answers[q.id])
          const isActive = index === currentQuestionIndex
          return (
            <button
              key={q.id}
              type="button"
              className={`edu-quiz-solve-qnav__item${isActive ? ' edu-quiz-solve-qnav__item--active' : ''}`}
              onClick={() => onSelectQuestionIndex(index)}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="edu-quiz-solve-qnav__num">{q.questionNumber}</span>
              <span className="edu-quiz-solve-qnav__summary" title={summary}>
                {summary}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

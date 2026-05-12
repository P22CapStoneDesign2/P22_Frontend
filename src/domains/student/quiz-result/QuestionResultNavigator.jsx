import './QuestionResultNavigator.css'

function summarizeUserAnswer(question) {
  if (question.type === 'multipleChoice') {
    const selectedId = question.userSelectedOptionId
    if (!selectedId) return '미응답'
    const picked = (question.options ?? []).find((o) => o.id === selectedId)
    if (!picked) return '선택됨'
    return picked.text.length > 20 ? `${picked.text.slice(0, 20)}…` : picked.text
  }

  const text = question.userShortAnswer ? question.userShortAnswer.trim() : ''
  if (!text) return '미응답'
  return text.length > 18 ? `${text.slice(0, 18)}…` : text
}

/**
 * 결과 화면 전용 문제 네비게이터.
 * 문제 번호 + 사용자 답 요약 + 정오를 함께 표시합니다.
 */
export default function QuestionResultNavigator({
  resultQuestions,
  currentQuestionIndex,
  onSelectQuestionIndex,
}) {
  return (
    <nav className="edu-quiz-result-qnav" aria-label="문제 결과 목록">
      <p className="edu-quiz-result-qnav__title">문제 결과</p>
      <div className="edu-quiz-result-qnav__list">
        {resultQuestions.map((q, idx) => {
          const isActive = idx === currentQuestionIndex
          const summary = summarizeUserAnswer(q)
          return (
            <button
              key={q.id}
              type="button"
              className={`edu-quiz-result-qnav__item${isActive ? ' edu-quiz-result-qnav__item--active' : ''}`}
              onClick={() => onSelectQuestionIndex(idx)}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="edu-quiz-result-qnav__num">{q.questionNumber}</span>
              <span className="edu-quiz-result-qnav__summary" title={summary}>
                {summary}
              </span>
              <span
                className={`edu-quiz-result-qnav__mark${q.isCorrect ? ' edu-quiz-result-qnav__mark--ok' : ' edu-quiz-result-qnav__mark--bad'}`}
              >
                {q.isCorrect ? '정답' : '오답'}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

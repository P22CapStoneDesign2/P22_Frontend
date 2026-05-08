import './QuestionNavigator.css'

/**
 * 오른쪽 sticky 문제 번호 네비 — 클릭 시 상위에서 scrollIntoView 처리
 */
export default function QuestionNavigator({ questions, activeQuestionId, onQuestionNavigate }) {
  return (
    <nav className="edu-q-nav" aria-label="문제 번호 이동">
      <p className="edu-q-nav__title">문제</p>
      <div className="edu-q-nav__buttons">
        {questions.map((q, index) => {
          const num = index + 1
          const isActive = q.id === activeQuestionId
          return (
            <button
              key={q.id}
              type="button"
              className={`edu-q-nav__btn${isActive ? ' edu-q-nav__btn--active' : ''}`}
              onClick={() => onQuestionNavigate(q.id)}
              aria-current={isActive ? 'true' : undefined}
            >
              {num}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

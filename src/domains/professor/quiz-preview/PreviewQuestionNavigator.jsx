import './PreviewQuestionNavigator.css'

/**
 * 교수 퀴즈 미리보기 — 왼쪽 문제 번호 세로 네비게이션
 */
export default function PreviewQuestionNavigator({
  total,
  currentQuestionIndex,
  onSelectQuestionIndex,
}) {
  return (
    <nav className="edu-quiz-preview-qnav" aria-label="문제 번호">
      <p className="edu-quiz-preview-qnav__title">문제</p>
      <div className="edu-quiz-preview-qnav__list">
        {Array.from({ length: total }, (_, index) => {
          const isActive = index === currentQuestionIndex
          return (
            <button
              key={index}
              type="button"
              className={`edu-quiz-preview-qnav__item${isActive ? ' edu-quiz-preview-qnav__item--active' : ''}`}
              onClick={() => onSelectQuestionIndex(index)}
              aria-current={isActive ? 'step' : undefined}
            >
              {index + 1}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

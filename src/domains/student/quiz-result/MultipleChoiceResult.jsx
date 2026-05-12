import './MultipleChoiceResult.css'

function getOptionStatus(question, optionId) {
  const isCorrectOption = question.correctOptionId === optionId
  const isUserSelected = question.userSelectedOptionId === optionId

  if (isCorrectOption) return 'correct'
  if (isUserSelected && !question.isCorrect) return 'wrong'
  return 'normal'
}

/**
 * 객관식 결과 표시:
 * - 실제 정답: 초록
 * - 사용자가 고른 오답: 빨강
 */
export default function MultipleChoiceResult({ question }) {
  return (
    <div className="edu-quiz-result-mc">
      <p className="edu-quiz-result-mc__label">보기 결과</p>
      <ul className="edu-quiz-result-mc__list">
        {(question.options ?? []).map((opt, idx) => {
          const status = getOptionStatus(question, opt.id)
          return (
            <li
              key={opt.id}
              className={`edu-quiz-result-mc__item edu-quiz-result-mc__item--${status}`}
            >
              <span className="edu-quiz-result-mc__num">{idx + 1}</span>
              <span className="edu-quiz-result-mc__text">{opt.text}</span>
              <span className="edu-quiz-result-mc__tag">
                {status === 'correct'
                  ? '정답'
                  : status === 'wrong'
                    ? '내 선택'
                    : ''}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

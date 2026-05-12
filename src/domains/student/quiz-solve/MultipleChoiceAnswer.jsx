import Button from '../../../components/ui/Button/Button.jsx'
import './MultipleChoiceAnswer.css'

/**
 * 객관식 보기 — 선택은 상위 answers 상태로만 관리 (내부 useState 없음)
 */
export default function MultipleChoiceAnswer({ options, selectedOptionId, onSelectOption }) {
  return (
    <div className="edu-quiz-solve-mc" role="group" aria-label="객관식 보기">
      <p className="edu-quiz-solve-mc__label">보기</p>
      <ul className="edu-quiz-solve-mc__list">
        {options.map((opt, index) => {
          const isSelected = selectedOptionId === opt.id
          return (
            <li key={opt.id} className="edu-quiz-solve-mc__item">
              <Button
                type="button"
                variant={isSelected ? 'primary' : 'secondary'}
                className={`edu-quiz-solve-mc__btn${isSelected ? ' edu-quiz-solve-mc__btn--selected' : ''}`}
                onClick={() => onSelectOption(opt.id)}
              >
                <span className="edu-quiz-solve-mc__badge">{index + 1}</span>
                <span className="edu-quiz-solve-mc__text">{opt.text}</span>
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

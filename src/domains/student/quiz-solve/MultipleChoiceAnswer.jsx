import Button from '../../../components/ui/Button/Button.jsx'
import { getMcSelectionHint } from './multipleChoiceSelectionUtils.js'
import './MultipleChoiceAnswer.css'

/**
 * 객관식 보기 — requiredAnswerCount 기준 단일/다중 선택, 재클릭 시 선택 해제
 */
export default function MultipleChoiceAnswer({
  options,
  requiredAnswerCount = 1,
  selectedOptionIds = [],
  limitMessage = '',
  disabled = false,
  onToggleOption,
}) {
  const maxCount = Math.max(1, requiredAnswerCount)
  const selectedSet = new Set(selectedOptionIds)
  const selectedCount = selectedOptionIds.length
  const { instruction, progress } = getMcSelectionHint(maxCount, selectedCount)

  return (
    <div className="edu-quiz-solve-mc" role="group" aria-label="객관식 보기">
      <div className="edu-quiz-solve-mc__hints" aria-live="polite">
        <p className="edu-quiz-solve-mc__instruction">{instruction}</p>
        <p className="edu-quiz-solve-mc__progress">{progress}</p>
        {limitMessage ? (
          <p className="edu-quiz-solve-mc__limit-msg" role="status">
            {limitMessage}
          </p>
        ) : null}
      </div>
      <p className="edu-quiz-solve-mc__label">보기</p>
      <ul className="edu-quiz-solve-mc__list">
        {options.map((opt, index) => {
          const isSelected = selectedSet.has(opt.id)
          return (
            <li key={opt.id} className="edu-quiz-solve-mc__item">
              <Button
                type="button"
                variant={isSelected ? 'primary' : 'secondary'}
                className={`edu-quiz-solve-mc__btn${isSelected ? ' edu-quiz-solve-mc__btn--selected' : ''}`}
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() => onToggleOption(opt.id)}
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

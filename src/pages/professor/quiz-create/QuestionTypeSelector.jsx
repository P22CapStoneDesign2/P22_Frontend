import Button from '../../../components/ui/Button/Button.jsx'
import './QuestionTypeSelector.css'

/**
 * 문항 유형: 객관식(multipleChoice) / 단답형(shortAnswer)
 */
export default function QuestionTypeSelector({ value, onChange, disabled = false }) {
  return (
    <div className="edu-q-type-select" role="group" aria-label="문항 유형">
      <span className="edu-q-type-select__label">문항 유형</span>
      <div className="edu-q-type-select__buttons">
        <Button
          type="button"
          variant={value === 'multipleChoice' ? 'primary' : 'secondary'}
          disabled={disabled}
          onClick={() => onChange('multipleChoice')}
        >
          객관식
        </Button>
        <Button
          type="button"
          variant={value === 'shortAnswer' ? 'primary' : 'secondary'}
          disabled={disabled}
          onClick={() => onChange('shortAnswer')}
        >
          단답형
        </Button>
      </div>
    </div>
  )
}

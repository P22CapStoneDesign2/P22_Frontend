import Button from '../../../components/ui/Button/Button.jsx'
import './QuizNavigationButtons.css'

export default function QuizNavigationButtons({
  onPrev,
  onNext,
  onSubmit,
  isPrevDisabled,
  isNextDisabled,
  isSubmitDisabled = false,
  submitLabel,
}) {
  return (
    <div className="edu-quiz-solve-nav-btns">
      <Button type="button" variant="secondary" disabled={isPrevDisabled} onClick={onPrev}>
        이전
      </Button>
      <Button type="button" variant="secondary" disabled={isNextDisabled} onClick={onNext}>
        다음
      </Button>
      <Button
        type="button"
        variant="primary"
        disabled={isSubmitDisabled}
        onClick={onSubmit}
      >
        {submitLabel ?? '제출 및 종료'}
      </Button>
    </div>
  )
}

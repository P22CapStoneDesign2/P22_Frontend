import Button from '../../../components/ui/Button/Button.jsx'
import './QuizNavigationButtons.css'

export default function QuizNavigationButtons({
  onPrev,
  onNext,
  onSubmit,
  isPrevDisabled,
  isNextDisabled,
  isLastQuestion = false,
}) {
  return (
    <div className="edu-quiz-solve-nav-btns">
      <Button type="button" variant="secondary" disabled={isPrevDisabled} onClick={onPrev}>
        이전
      </Button>
      {isLastQuestion ? (
        <Button type="button" variant="primary" onClick={onSubmit}>
          제출
        </Button>
      ) : (
        <Button type="button" variant="secondary" disabled={isNextDisabled} onClick={onNext}>
          다음
        </Button>
      )}
    </div>
  )
}

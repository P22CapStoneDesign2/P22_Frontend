import Button from '../../../components/ui/Button/Button.jsx'
import './ResultNavigationButtons.css'

export default function ResultNavigationButtons({
  onPrev,
  onNext,
  onExit,
  isPrevDisabled,
  isNextDisabled,
}) {
  return (
    <div className="edu-quiz-result-nav-btns">
      <Button type="button" variant="secondary" disabled={isPrevDisabled} onClick={onPrev}>
        이전
      </Button>
      <Button type="button" variant="secondary" disabled={isNextDisabled} onClick={onNext}>
        다음
      </Button>
      <Button type="button" variant="primary" onClick={onExit}>
        나가기
      </Button>
    </div>
  )
}

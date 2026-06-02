import Button from '../../../components/ui/Button/Button.jsx'
import './PreviewNavigationButtons.css'

/**
 * 미리보기 하단 — 이전 / 다음 / 종료 (제출 없음)
 */
export default function PreviewNavigationButtons({
  onPrev,
  onNext,
  onExit,
  isPrevDisabled,
  isNextDisabled,
}) {
  return (
    <div className="edu-quiz-preview-nav-btns">
      <Button type="button" variant="secondary" disabled={isPrevDisabled} onClick={onPrev}>
        이전
      </Button>
      <Button type="button" variant="secondary" disabled={isNextDisabled} onClick={onNext}>
        다음
      </Button>
      <Button type="button" variant="primary" onClick={onExit}>
        종료
      </Button>
    </div>
  )
}

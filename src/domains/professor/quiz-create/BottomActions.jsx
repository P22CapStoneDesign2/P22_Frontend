import Button from '../../../components/ui/Button/Button.jsx'
import './BottomActions.css'

/** 하단 고정 느낌의 액션 바 — flex로 본문 하단에 배치 */
export default function BottomActions({ onAddQuestion, onSaveClick }) {
  return (
    <div className="edu-quiz-bottom-actions">
      <Button type="button" variant="secondary" onClick={onAddQuestion}>
        추가
      </Button>
      <Button type="button" variant="primary" onClick={onSaveClick}>
        퀴즈 저장
      </Button>
    </div>
  )
}

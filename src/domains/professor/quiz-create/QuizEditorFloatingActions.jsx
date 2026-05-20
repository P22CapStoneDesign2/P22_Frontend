import Button from '../../../components/ui/Button/Button.jsx'
import './QuizEditorFloatingActions.css'

/**
 * 수정/생성 화면 — 우측 열 하단 sticky 액션 (문제 추가 · 저장 · 취소)
 */
export default function QuizEditorFloatingActions({
  onAddQuestion,
  onSaveClick,
  onCancelClick,
  isEditable = true,
}) {
  if (!isEditable) return null

  return (
    <div className="edu-quiz-floating-actions" aria-label="퀴즈 편집 작업">
      <Button type="button" variant="secondary" className="edu-quiz-floating-actions__btn" onClick={onAddQuestion}>
        문제 추가
      </Button>
      <Button type="button" variant="primary" className="edu-quiz-floating-actions__btn" onClick={onSaveClick}>
        저장
      </Button>
      <Button type="button" variant="ghost" className="edu-quiz-floating-actions__btn" onClick={onCancelClick}>
        취소
      </Button>
    </div>
  )
}

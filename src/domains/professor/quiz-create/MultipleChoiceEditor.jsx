import Button from '../../../components/ui/Button/Button.jsx'
import './MultipleChoiceEditor.css'

/**
 * 객관식 보기 + 정답 체크박스 (복수 선택 허용)
 *
 * @param {object} props
 * @param {string} props.questionId
 * @param {Array<{ id: string, text: string }>} props.options
 * @param {string[]} props.correctOptionIds  복수 정답 ID 배열 (없으면 빈 배열)
 * @param {(questionId: string, optionId: string, text: string) => void} props.onOptionTextChange
 * @param {(questionId: string, optionId: string) => void} props.onCorrectChange  체크 토글
 * @param {(questionId: string) => void} props.onAddOption
 */
export default function MultipleChoiceEditor({
  questionId,
  options,
  correctOptionIds,
  onOptionTextChange,
  onCorrectChange,
  onAddOption,
  readOnly = false,
}) {
  const correctSet = new Set(Array.isArray(correctOptionIds) ? correctOptionIds : [])

  return (
    <div className="edu-mc-editor">
      <div className="edu-mc-editor__header">
        <span className="edu-mc-editor__title">보기</span>
        {!readOnly ? (
          <Button type="button" variant="secondary" onClick={() => onAddOption(questionId)}>
            보기 추가
          </Button>
        ) : null}
      </div>
      <ul className="edu-mc-editor__list">
        {options.map((opt, index) => {
          const isChecked = correctSet.has(opt.id)
          return (
            <li key={opt.id} className="edu-mc-editor__item">
              <label className="edu-mc-editor__check-label">
                <input
                  type="checkbox"
                  className="edu-mc-editor__checkbox"
                  checked={isChecked}
                  disabled={readOnly}
                  onChange={() => {
                    if (readOnly) return
                    onCorrectChange(questionId, opt.id)
                  }}
                  aria-label={`${index + 1}번 보기를 정답으로 ${isChecked ? '해제' : '선택'}`}
                />
                <span className="edu-mc-editor__badge">{index + 1}</span>
              </label>
              <input
                type="text"
                className="edu-mc-editor__input"
                value={opt.text}
                readOnly={readOnly}
                disabled={readOnly}
                onChange={(e) => {
                  if (readOnly) return
                  onOptionTextChange(questionId, opt.id, e.target.value)
                }}
                placeholder={`보기 ${index + 1}`}
                aria-label={`보기 ${index + 1} 내용`}
              />
            </li>
          )
        })}
      </ul>
      <p className="edu-mc-editor__hint">정답은 여러 개 선택할 수 있습니다.</p>
    </div>
  )
}

import './ShortAnswerEditor.css'

/** 단답형: 정답 한 줄 입력 */
export default function ShortAnswerEditor({ id, value, onChange }) {
  const inputId = id ?? 'short-answer-input'
  return (
    <div className="edu-sa-editor">
      <label className="edu-sa-editor__label" htmlFor={inputId}>
        정답
      </label>
      <input
        id={inputId}
        type="text"
        className="edu-sa-editor__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="정답을 입력하세요"
        autoComplete="off"
      />
    </div>
  )
}

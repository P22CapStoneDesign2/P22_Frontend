import './ExplanationEditor.css'

/** 해설 textarea */
export default function ExplanationEditor({ value, onChange, id }) {
  const fieldId = id ?? 'explanation-default'
  return (
    <div className="edu-expl-editor">
      <label className="edu-expl-editor__label" htmlFor={fieldId}>
        해설
      </label>
      <textarea
        id={fieldId}
        className="edu-expl-editor__textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="해설을 입력하세요 (선택)"
        rows={4}
      />
    </div>
  )
}

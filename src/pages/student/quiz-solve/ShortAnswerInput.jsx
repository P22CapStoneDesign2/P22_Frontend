import './ShortAnswerInput.css'

/** 단답형 — 제어 컴포넌트만 (상위 answers) */
export default function ShortAnswerInput({ id, value, onChange }) {
  const inputId = id ?? 'short-answer-solve'
  return (
    <div className="edu-quiz-solve-sa">
      <label className="edu-quiz-solve-sa__label" htmlFor={inputId}>
        답안
      </label>
      <input
        id={inputId}
        type="text"
        className="edu-quiz-solve-sa__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="답을 입력하세요"
        autoComplete="off"
      />
    </div>
  )
}

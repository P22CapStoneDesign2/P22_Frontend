import { useState } from 'react'
import './PreviewShortAnswer.css'

/**
 * 교수 퀴즈 미리보기 — 단답형 입력칸 형태 (로컬 입력만, 제출·저장 없음)
 * 문항 전환 시 상위에서 key로 리마운트합니다.
 */
export default function PreviewShortAnswer({ questionId }) {
  const [value, setValue] = useState('')

  return (
    <div className="edu-quiz-preview-sa">
      <label className="edu-quiz-preview-sa__label" htmlFor={`quiz-preview-sa-${questionId}`}>
        답안 입력
      </label>
      <textarea
        id={`quiz-preview-sa-${questionId}`}
        className="edu-quiz-preview-sa__input"
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="미리보기입니다. 입력 내용은 저장되지 않습니다."
        autoComplete="off"
      />
    </div>
  )
}

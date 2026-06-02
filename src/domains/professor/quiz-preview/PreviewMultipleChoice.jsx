import Button from '../../../components/ui/Button/Button.jsx'
import { useState } from 'react'
import './PreviewMultipleChoice.css'

/**
 * 교수 퀴즈 미리보기 — 객관식 보기 (선택 강조만, 상위 상태 없음)
 * 문항 전환 시 상위에서 key로 리마운트하여 선택 상태를 초기화합니다.
 */
export default function PreviewMultipleChoice({ options }) {
  const [selectedOptionId, setSelectedOptionId] = useState(null)

  return (
    <div className="edu-quiz-preview-mc" role="group" aria-label="객관식 보기">
      <p className="edu-quiz-preview-mc__label">보기</p>
      <ul className="edu-quiz-preview-mc__list">
        {options.map((opt, index) => {
          const isSelected = selectedOptionId === opt.id
          return (
            <li key={opt.id} className="edu-quiz-preview-mc__item">
              <Button
                type="button"
                variant={isSelected ? 'primary' : 'secondary'}
                className={`edu-quiz-preview-mc__btn${isSelected ? ' edu-quiz-preview-mc__btn--selected' : ''}`}
                onClick={() => setSelectedOptionId(isSelected ? null : opt.id)}
              >
                <span className="edu-quiz-preview-mc__badge">{index + 1}</span>
                <span className="edu-quiz-preview-mc__text">{opt.text}</span>
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

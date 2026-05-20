import Button from '../../../components/ui/Button/Button.jsx'

/**
 * 퀴즈 테이블 단일 행 (선택 / 번호 / 질문 / 문제유형 / 수정일 / 보기)
 */
export default function QuizTableRow({
  index,
  quiz,
  checked,
  onToggle,
  selectionDisabled = false,
  onView,
}) {
  const typeLabel = quiz.questionType === 'multiple' ? '객관식' : '단답형'
  const dateLabel = formatUpdatedAt(quiz.updatedAt)

  return (
    <tr className={`edu-quiz-table__row${checked ? ' edu-quiz-table__row--selected' : ''}`}>
      <td className="edu-quiz-table__cell edu-quiz-table__cell--check">
        <input
          type="checkbox"
          className="edu-quiz-table__checkbox"
          checked={checked}
          disabled={selectionDisabled}
          onChange={onToggle}
          aria-label={`문제 ${index + 1} 선택`}
        />
      </td>
      <td className="edu-quiz-table__cell edu-quiz-table__cell--num">{index + 1}</td>
      <td className="edu-quiz-table__cell edu-quiz-table__cell--question">{quiz.question}</td>
      <td className="edu-quiz-table__cell">{typeLabel}</td>
      <td className="edu-quiz-table__cell edu-quiz-table__cell--date">{dateLabel}</td>
      <td className="edu-quiz-table__cell edu-quiz-table__cell--action">
        <Button type="button" variant="secondary" onClick={onView}>
          보기
        </Button>
      </td>
    </tr>
  )
}

function formatUpdatedAt(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

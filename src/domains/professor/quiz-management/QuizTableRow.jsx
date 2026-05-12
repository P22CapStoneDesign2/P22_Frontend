import Button from '../../../components/ui/Button/Button.jsx'

/**
 * 퀴즈 테이블 단일 행 (번호 / 질문 / 문제유형 / 수정일 / 보기)
 *
 * @param {object} props
 * @param {number} props.index - 0-based; 화면에는 index + 1로 표시
 * @param {{ id: string, question: string, questionType: 'multiple' | 'short', updatedAt: string }} props.quiz
 * @param {() => void} props.onView - 보기 버튼 클릭 시 편집 라우트로 이동하는 쪽에서 연결
 */
export default function QuizTableRow({ index, quiz, onView }) {
  const typeLabel = quiz.questionType === 'multiple' ? '객관식' : '단답형'
  const dateLabel = formatUpdatedAt(quiz.updatedAt)

  return (
    <tr className="edu-quiz-table__row">
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

/** mock 단계: ISO 또는 표시용 문자열을 그대로/간단히 포맷 */
function formatUpdatedAt(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

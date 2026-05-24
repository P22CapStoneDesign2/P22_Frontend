import './QuizTable.css'
import QuizTableRow from './QuizTableRow.jsx'

/**
 * 선택된 교안의 퀴즈 목록 테이블
 */
export default function QuizTable({
  quizzes,
  selectedQuestionIds,
  onToggleQuestion,
  onToggleAll,
  onViewQuiz,
  selectionDisabled = false,
  emptyHint = '등록된 문항이 없습니다.',
}) {
  const isEmpty = !quizzes || quizzes.length === 0
  const allIds = isEmpty ? [] : quizzes.map((q) => q.questionId)
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedQuestionIds.has(id))
  const someSelected = allIds.some((id) => selectedQuestionIds.has(id))

  return (
    <div className="edu-quiz-table-wrap">
      <table className="edu-quiz-table">
        <caption className="edu-quiz-table__caption">퀴즈 목록</caption>
        <thead>
          <tr>
            <th scope="col" className="edu-quiz-table__th edu-quiz-table__th--check">
              <input
                type="checkbox"
                className="edu-quiz-table__checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected
                }}
                disabled={isEmpty || selectionDisabled}
                onChange={(e) => onToggleAll(e.target.checked)}
                aria-label="전체 선택"
              />
            </th>
            <th scope="col" className="edu-quiz-table__th edu-quiz-table__th--num">
              번호
            </th>
            <th scope="col" className="edu-quiz-table__th">
              질문
            </th>
            <th scope="col" className="edu-quiz-table__th">
              문제유형
            </th>
            <th scope="col" className="edu-quiz-table__th">
              수정한 날짜
            </th>
            <th scope="col" className="edu-quiz-table__th edu-quiz-table__th--action">
              보기
            </th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={6} className="edu-quiz-table__empty">
                {emptyHint}
              </td>
            </tr>
          ) : (
            quizzes.map((quiz, index) => (
              <QuizTableRow
                key={quiz.id}
                index={index}
                quiz={quiz}
                checked={selectedQuestionIds.has(quiz.questionId)}
                onToggle={() => onToggleQuestion(quiz.questionId)}
                selectionDisabled={selectionDisabled}
                onView={() => onViewQuiz(quiz.quizSetId, quiz.questionId)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

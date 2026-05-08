import './QuizTable.css'
import QuizTableRow from './QuizTableRow.jsx'

/**
 * 선택된 교안의 퀴즈 목록 테이블
 *
 * @param {object} props
 * @param {Array<{ id: string, question: string, questionType: 'multiple' | 'short', updatedAt: string }>} props.quizzes
 * @param {(quizId: string) => void} props.onViewQuiz
 */
export default function QuizTable({ quizzes, onViewQuiz }) {
  const isEmpty = !quizzes || quizzes.length === 0

  return (
    <div className="edu-quiz-table-wrap">
      <table className="edu-quiz-table">
        <caption className="edu-quiz-table__caption">퀴즈 목록</caption>
        <thead>
          <tr>
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
              <td colSpan={5} className="edu-quiz-table__empty">
                등록된 퀴즈가 없습니다. 교안을 선택하거나 퀴즈를 생성해 보세요.
              </td>
            </tr>
          ) : (
            quizzes.map((quiz, index) => (
              <QuizTableRow
                key={quiz.id}
                index={index}
                quiz={quiz}
                onView={() => onViewQuiz(quiz.id)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

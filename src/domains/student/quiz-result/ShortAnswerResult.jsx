import './ShortAnswerResult.css'

/**
 * 단답형 결과 표시:
 * - 정답: 사용자 답 초록
 * - 오답: 사용자 답 빨강 + 실제 정답 표시
 */
export default function ShortAnswerResult({ question }) {
  const userAnswer = question.userShortAnswer?.trim() || '미응답'
  const isCorrect = question.isCorrect

  return (
    <div className="edu-quiz-result-sa">
      <p className="edu-quiz-result-sa__label">답안 결과</p>
      <div
        className={`edu-quiz-result-sa__user edu-quiz-result-sa__user--${isCorrect ? 'ok' : 'bad'}`}
      >
        <span className="edu-quiz-result-sa__key">내 답</span>
        <span className="edu-quiz-result-sa__val">{userAnswer}</span>
      </div>
      {!isCorrect ? (
        <div className="edu-quiz-result-sa__correct">
          <span className="edu-quiz-result-sa__key">정답</span>
          <span className="edu-quiz-result-sa__val">{question.correctAnswer ?? '—'}</span>
        </div>
      ) : null}
    </div>
  )
}

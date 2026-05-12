import MultipleChoiceResult from './MultipleChoiceResult.jsx'
import ShortAnswerResult from './ShortAnswerResult.jsx'
import ExplanationBox from './ExplanationBox.jsx'
import ResultNavigationButtons from './ResultNavigationButtons.jsx'
import './ResultContent.css'

/**
 * 현재 문제 결과 상세 카드 본문.
 */
export default function ResultContent({
  question,
  onPrev,
  onNext,
  onExit,
  isPrevDisabled,
  isNextDisabled,
}) {
  if (!question) return null

  const typeLabel = question.type === 'multipleChoice' ? '객관식' : '단답형'

  return (
    <section className="edu-quiz-result-content">
      <header className="edu-quiz-result-content__head">
        <span className="edu-quiz-result-content__num">문제 {question.questionNumber}</span>
        <span className="edu-quiz-result-content__type">{typeLabel}</span>
        <span
          className={`edu-quiz-result-content__mark${question.isCorrect ? ' edu-quiz-result-content__mark--ok' : ' edu-quiz-result-content__mark--bad'}`}
        >
          {question.isCorrect ? '정답' : '오답'}
        </span>
      </header>

      <p className="edu-quiz-result-content__question">{question.content}</p>

      {question.type === 'multipleChoice' ? (
        <MultipleChoiceResult question={question} />
      ) : (
        <ShortAnswerResult question={question} />
      )}

      <ExplanationBox explanation={question.explanation} />

      <ResultNavigationButtons
        onPrev={onPrev}
        onNext={onNext}
        onExit={onExit}
        isPrevDisabled={isPrevDisabled}
        isNextDisabled={isNextDisabled}
      />
    </section>
  )
}

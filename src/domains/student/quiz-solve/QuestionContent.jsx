import MultipleChoiceAnswer from './MultipleChoiceAnswer.jsx'
import ShortAnswerInput from './ShortAnswerInput.jsx'
import './QuestionContent.css'

/**
 * 현재 문제 카드 — 상태 없음, 답 변경은 콜백으로 상위 answers 갱신
 */
export default function QuestionContent({
  question,
  answer,
  onSelectMcOption,
  onShortAnswerChange,
}) {
  if (!question) return null

  const typeLabel = question.type === 'multipleChoice' ? '객관식' : '단답형'

  return (
    <div className="edu-quiz-solve-qbody">
      <div className="edu-quiz-solve-qbody__head">
        <span className="edu-quiz-solve-qbody__num">문제 {question.questionNumber}</span>
        <span className="edu-quiz-solve-qbody__type">{typeLabel}</span>
      </div>
      <p className="edu-quiz-solve-qbody__content">{question.content}</p>

      {question.type === 'multipleChoice' ? (
        <MultipleChoiceAnswer
          options={question.options ?? []}
          selectedOptionId={answer?.selectedOptionId}
          onSelectOption={onSelectMcOption}
        />
      ) : (
        <ShortAnswerInput
          id={`sa-solve-${question.id}`}
          value={answer?.shortAnswer ?? ''}
          onChange={onShortAnswerChange}
        />
      )}
    </div>
  )
}

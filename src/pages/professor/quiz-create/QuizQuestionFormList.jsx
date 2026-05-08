import QuizQuestionForm from './QuizQuestionForm.jsx'

/**
 * 문제 폼 목록 — 각 카드에 ref를 붙여 네비게이터와 scrollIntoView 연결
 */
export default function QuizQuestionFormList({
  questions,
  formRefs,
  onContentChange,
  onTypeChange,
  onOptionTextChange,
  onCorrectOptionChange,
  onAddOption,
  onShortAnswerChange,
  onExplanationChange,
}) {
  return (
    <div className="edu-quiz-form-list">
      {questions.map((question, questionIndex) => (
        <QuizQuestionForm
          key={question.id}
          ref={(el) => {
            formRefs.current[question.id] = el
          }}
          question={question}
          questionIndex={questionIndex}
          onContentChange={onContentChange}
          onTypeChange={onTypeChange}
          onOptionTextChange={onOptionTextChange}
          onCorrectOptionChange={onCorrectOptionChange}
          onAddOption={onAddOption}
          onShortAnswerChange={onShortAnswerChange}
          onExplanationChange={onExplanationChange}
        />
      ))}
    </div>
  )
}

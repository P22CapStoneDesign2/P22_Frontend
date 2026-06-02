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
  onDeleteOption,
  onShortAnswerChange,
  onExplanationChange,
  isEditable = true,
  activeQuestionId = null,
  displayNumberOffset = 0,
}) {
  const visibleQuestions =
    !isEditable && activeQuestionId != null
      ? questions.filter((q) => q.id === activeQuestionId)
      : questions

  return (
    <div className="edu-quiz-form-list">
      {visibleQuestions.map((question) => {
        const questionIndex = questions.findIndex((q) => q.id === question.id)
        return (
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
            onDeleteOption={onDeleteOption}
            onShortAnswerChange={onShortAnswerChange}
            onExplanationChange={onExplanationChange}
            isEditable={isEditable}
            displayNumberOffset={displayNumberOffset}
          />
        )
      })}
    </div>
  )
}

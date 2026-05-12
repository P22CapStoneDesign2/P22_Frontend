import { forwardRef } from 'react'
import QuestionTypeSelector from './QuestionTypeSelector.jsx'
import MultipleChoiceEditor from './MultipleChoiceEditor.jsx'
import ShortAnswerEditor from './ShortAnswerEditor.jsx'
import ExplanationEditor from './ExplanationEditor.jsx'
import './QuizQuestionForm.css'

/**
 * 단일 문제 폼 — 내부 useState 없음, 모두 상위 questions + 콜백으로 제어
 */
const QuizQuestionForm = forwardRef(function QuizQuestionForm(
  {
    question,
    questionIndex,
    onContentChange,
    onTypeChange,
    onOptionTextChange,
    onCorrectOptionChange,
    onAddOption,
    onShortAnswerChange,
    onExplanationChange,
  },
  ref,
) {
  const displayNumber = questionIndex + 1

  return (
    <section
      ref={ref}
      className="edu-quiz-form-card"
      data-question-id={question.id}
      aria-labelledby={`edu-quiz-form-title-${question.id}`}
    >
      <h2 id={`edu-quiz-form-title-${question.id}`} className="edu-quiz-form-card__heading">
        {displayNumber}번 문제
      </h2>

      <div className="edu-quiz-form-card__field">
        <label className="edu-quiz-form-card__label" htmlFor={`edu-q-content-${question.id}`}>
          문제 내용
        </label>
        <textarea
          id={`edu-q-content-${question.id}`}
          className="edu-quiz-form-card__textarea"
          value={question.content}
          onChange={(e) => onContentChange(question.id, e.target.value)}
          placeholder="문제를 입력하세요"
          rows={4}
        />
      </div>

      <QuestionTypeSelector
        value={question.type}
        onChange={(type) => onTypeChange(question.id, type)}
      />

      {question.type === 'multipleChoice' ? (
        <MultipleChoiceEditor
          questionId={question.id}
          options={question.options ?? []}
          correctOptionIds={question.correctOptionIds}
          onOptionTextChange={onOptionTextChange}
          onCorrectChange={onCorrectOptionChange}
          onAddOption={onAddOption}
        />
      ) : (
        <ShortAnswerEditor
          id={`sa-${question.id}`}
          value={question.shortAnswer}
          onChange={(v) => onShortAnswerChange(question.id, v)}
        />
      )}

      <ExplanationEditor
        id={`ex-${question.id}`}
        value={question.explanation}
        onChange={(v) => onExplanationChange(question.id, v)}
      />
    </section>
  )
})

export default QuizQuestionForm

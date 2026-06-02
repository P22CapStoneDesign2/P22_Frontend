import PreviewMultipleChoice from './PreviewMultipleChoice.jsx'
import PreviewShortAnswer from './PreviewShortAnswer.jsx'
import './PreviewQuestionContent.css'

/**
 * 미리보기 — 현재 문항 본문 (정답·해설 없음)
 *
 * @param {object} props
 * @param {{ id: string, content: string, type: string, options?: { id: string, text: string }[] } | null} props.question
 * @param {number} props.questionNumber - 1-based 표시 번호
 */
export default function PreviewQuestionContent({ question, questionNumber }) {
  if (!question) return null

  const typeLabel = question.type === 'multipleChoice' ? '객관식' : '단답형'

  return (
    <div className="edu-quiz-preview-qbody">
      <div className="edu-quiz-preview-qbody__head">
        <span className="edu-quiz-preview-qbody__num">문제 {questionNumber}</span>
        <span className="edu-quiz-preview-qbody__type">{typeLabel}</span>
      </div>
      <p className="edu-quiz-preview-qbody__content">{question.content}</p>

      {question.type === 'multipleChoice' ? (
        <PreviewMultipleChoice key={question.id} options={question.options ?? []} />
      ) : (
        <PreviewShortAnswer key={question.id} questionId={question.id} />
      )}
    </div>
  )
}

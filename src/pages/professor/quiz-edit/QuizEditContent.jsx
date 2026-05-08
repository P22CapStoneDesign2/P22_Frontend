import QuizEditorContent from '../quiz-create/QuizEditorContent.jsx'
import { buildQuizEditDto } from '../quiz-create/quizCreateUtils.js'

/**
 * 수정 전용: preload된 문제·교안 ID를 QuizEditorContent에 넘김
 */
export default function QuizEditContent({ quizId, materialId, initialQuestions }) {
  return (
    <QuizEditorContent
      materialId={materialId}
      quizId={quizId}
      initialQuestions={initialQuestions}
      confirmMessage="수정하시겠습니까?"
      buildDto={(mid, qs, qid) => buildQuizEditDto(qid, mid, qs)}
    />
  )
}

import QuizEditorContent from './QuizEditorContent.jsx'
import { buildQuizSaveDto } from './quizCreateUtils.js'

/**
 * 생성 전용: QuizEditorContent에 저장 문구·DTO 빌더만 주입
 */
export default function QuizCreateContent({ materialId }) {
  return (
    <QuizEditorContent
      materialId={materialId}
      quizId={null}
      initialQuestions={null}
      confirmMessage="저장하시겠습니까?"
      buildDto={(mid, qs, _qid) => buildQuizSaveDto(mid, qs)}
    />
  )
}

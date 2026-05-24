import QuizEditorContent from './QuizEditorContent.jsx'
import { buildQuizSaveDto } from './quizCreateUtils.js'
import { useIsViewerMode } from '../../../shared/auth/useUserRole.js'

/**
 * 생성 전용: QuizEditorContent에 저장 문구·DTO 빌더만 주입
 */
export default function QuizCreateContent({ materialId, displayNumberOffset = 0 }) {
  const { isViewerMode } = useIsViewerMode()

  return (
    <QuizEditorContent
      materialId={materialId}
      quizId={null}
      initialQuestions={null}
      displayNumberOffset={displayNumberOffset}
      isViewerMode={isViewerMode}
      confirmMessage="저장하시겠습니까?"
      buildDto={(mid, qs) => buildQuizSaveDto(mid, qs)}
    />
  )
}

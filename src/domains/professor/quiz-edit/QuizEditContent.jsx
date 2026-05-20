import QuizEditorContent from '../quiz-create/QuizEditorContent.jsx'
import { buildQuizEditDto } from '../quiz-create/quizCreateUtils.js'
import { useIsViewerMode } from '../../../shared/auth/useUserRole.js'

/**
 * 수정 전용: 교안 전체 문항 preload + 초기 포커스 문항
 */
export default function QuizEditContent({
  quizId,
  materialId,
  initialQuestions,
  initialActiveQuestionId,
  initialPersistedQuestionIds,
  primaryQuizSetId,
}) {
  const { isViewerMode } = useIsViewerMode()

  return (
    <QuizEditorContent
      key={`${materialId}-material-edit`}
      materialId={materialId}
      quizId={primaryQuizSetId ?? quizId}
      initialQuestions={initialQuestions}
      initialActiveQuestionId={initialActiveQuestionId}
      initialPersistedQuestionIds={initialPersistedQuestionIds}
      isMaterialEditMode
      isViewerMode={isViewerMode}
      confirmMessage={isViewerMode ? '' : '수정하시겠습니까?'}
      buildDto={(mid, qs, qid) => buildQuizEditDto(qid ?? quizId, mid, qs)}
    />
  )
}

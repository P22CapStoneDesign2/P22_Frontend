import QuizEditorContent from '../quiz-create/QuizEditorContent.jsx'
import { buildQuizEditDto } from '../quiz-create/quizCreateUtils.js'
import { useIsViewerMode } from '../../../shared/auth/useUserRole.js'
import { useProfessorAccountGate } from '../hooks/useProfessorAccountGate.js'
import ProfessorPendingNotice from '../components/ProfessorPendingNotice.jsx'

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
  const { isProfessorPending, canMutateProfessorContent } = useProfessorAccountGate()

  return (
    <>
      {isProfessorPending ? <ProfessorPendingNotice className="edu-quiz-create-page__pending" /> : null}
      <QuizEditorContent
        key={`${materialId}-material-edit`}
        materialId={materialId}
        lessonId={materialId}
        quizId={primaryQuizSetId ?? quizId}
        initialQuestions={initialQuestions}
        initialActiveQuestionId={initialActiveQuestionId}
        initialPersistedQuestionIds={initialPersistedQuestionIds}
        isMaterialEditMode
        isViewerMode={isViewerMode}
        professorFeaturesLocked={!canMutateProfessorContent}
        confirmMessage={isViewerMode ? '' : '수정하시겠습니까?'}
        buildDto={(mid, qs, qid) => buildQuizEditDto(qid ?? quizId, mid, qs)}
      />
    </>
  )
}

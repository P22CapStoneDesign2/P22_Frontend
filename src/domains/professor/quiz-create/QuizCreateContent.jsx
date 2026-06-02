import QuizEditorContent from './QuizEditorContent.jsx'
import { buildQuizSaveDto } from './quizCreateUtils.js'
import { useIsViewerMode } from '../../../shared/auth/useUserRole.js'
import { useProfessorAccountGate } from '../hooks/useProfessorAccountGate.js'
import ProfessorPendingNotice from '../components/ProfessorPendingNotice.jsx'

/**
 * 생성 전용: QuizEditorContent에 저장 문구·DTO 빌더만 주입
 */
export default function QuizCreateContent({ materialId = '', displayNumberOffset = 0 }) {
  const { isViewerMode } = useIsViewerMode()
  const { isProfessorPending, canMutateProfessorContent } = useProfessorAccountGate()

  return (
    <>
      {isProfessorPending ? <ProfessorPendingNotice className="edu-quiz-create-page__pending" /> : null}
      <QuizEditorContent
        materialId={materialId}
        lessonId={materialId}
        quizId={null}
        initialQuestions={null}
        displayNumberOffset={displayNumberOffset}
        isViewerMode={isViewerMode}
        professorFeaturesLocked={!canMutateProfessorContent}
        confirmMessage="저장하시겠습니까?"
        buildDto={(resolvedMaterialId, qs) => buildQuizSaveDto(resolvedMaterialId, qs)}
      />
    </>
  )
}

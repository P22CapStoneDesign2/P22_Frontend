import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import QuizEditorContent from '../quiz-create/QuizEditorContent.jsx'
import {
  addQuestion,
  deleteQuestion,
  updateQuestion,
  updateQuiz,
} from '../../quiz/api/quizApi.js'
import {
  isPersistedQuestionId,
  mapEditorQuestionToApiQuestionPayload,
  mapEditorQuestionToApiQuestionUpdatePayload,
} from '../../quiz/mappers/quizMapper.js'
import { ROUTES } from '../../../shared/constants/routes.js'

/**
 * 수정 전용 본문.
 *
 * 저장 시 호출 순서:
 * 1) `updateQuiz` — 세트 메타(title, description)
 * 2) 화면의 현재 문항 순회 — 서버 ID(`isPersistedQuestionId`)이면 `updateQuestion`, 아니면 `addQuestion`
 * 3) preload 시점에 있었지만 현재 화면에서 사라진 문항 → `deleteQuestion`
 *
 * 중간 실패 시 부분 적용된 상태는 그대로 둔다 (자동 롤백 없음). 사용자에게 에러 메시지로 노출 후 재시도하도록 한다.
 */
export default function QuizEditContent({
  quizId,
  materialId,
  initialTitle = '',
  initialDescription = '',
  initialQuestions,
  initialActiveQuestionId,
}) {
  const navigate = useNavigate()

  const originalPersistedIds = useMemo(
    () =>
      (initialQuestions ?? [])
        .map((q) => String(q?.id ?? ''))
        .filter((id) => isPersistedQuestionId(id)),
    [initialQuestions],
  )

  const handleConfirmSave = async ({ title, description, questions }) => {
    await updateQuiz(quizId, { title, description })

    const currentIds = new Set(questions.map((q) => String(q.id)))
    const deletedIds = originalPersistedIds.filter((id) => !currentIds.has(id))

    for (const q of questions) {
      if (isPersistedQuestionId(q.id)) {
        await updateQuestion(quizId, q.id, mapEditorQuestionToApiQuestionUpdatePayload(q))
      } else {
        await addQuestion(quizId, mapEditorQuestionToApiQuestionPayload(q))
      }
    }

    for (const id of deletedIds) {
      await deleteQuestion(quizId, id)
    }

    navigate(ROUTES.professorQuizzes)
  }

  return (
    <QuizEditorContent
      key={quizId}
      materialId={materialId}
      quizId={quizId}
      initialTitle={initialTitle}
      initialDescription={initialDescription}
      initialQuestions={initialQuestions}
      initialActiveQuestionId={initialActiveQuestionId}
      confirmMessage="수정하시겠습니까?"
      onConfirmSave={handleConfirmSave}
    />
  )
}

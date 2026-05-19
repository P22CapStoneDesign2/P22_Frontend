import { useNavigate } from 'react-router-dom'
import QuizEditorContent from './QuizEditorContent.jsx'
import { addQuestion, createQuiz, deleteQuiz } from '../../quiz/api/quizApi.js'
import { mapEditorQuestionToApiQuestionPayload } from '../../quiz/mappers/quizMapper.js'
import { ROUTES } from '../../../shared/constants/routes.js'

/**
 * 생성 전용: `createQuiz` 로 퀴즈 세트를 만들고, 편집기 문항을 `addQuestion`으로 순차 저장한다.
 *
 * 실패 처리:
 * - 퀴즈 세트 생성에 실패하면 그대로 throw (편집기에서 에러 메시지 노출).
 * - 문항 저장 중 실패하면 방금 만든 퀴즈를 `deleteQuiz`로 정리(best-effort) — 서버에 절반 저장된 퀴즈가 남지 않도록.
 */
export default function QuizCreateContent({ materialId }) {
  const navigate = useNavigate()

  const handleConfirmSave = async ({ title, description, questions }) => {
    const createRes = await createQuiz({ title, description })
    const quizId = createRes?.data?.data?.id
    if (quizId == null) {
      throw new Error('서버가 새 퀴즈 ID를 반환하지 않았습니다.')
    }

    try {
      // 순차 호출 — 백엔드 정렬·트랜잭션 보존을 위해 Promise.all 대신 직렬.
      for (const q of questions) {
        await addQuestion(quizId, mapEditorQuestionToApiQuestionPayload(q))
      }
    } catch (e) {
      try {
        await deleteQuiz(quizId)
      } catch {
        // 정리 실패는 무시 — 원본 에러를 그대로 던진다.
      }
      throw e
    }

    navigate(ROUTES.professorQuizzes)
  }

  return (
    <QuizEditorContent
      materialId={materialId}
      quizId={null}
      initialTitle=""
      initialDescription=""
      initialQuestions={null}
      confirmMessage="저장하시겠습니까?"
      onConfirmSave={handleConfirmSave}
    />
  )
}

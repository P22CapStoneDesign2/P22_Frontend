import { useParams } from 'react-router-dom'
import QuizEditContent from './QuizEditContent.jsx'
import { getMockQuizEditBundle } from './mockQuizEditData.js'
import '../quiz-create/QuizCreatePage.css'

export default function QuizEditPage() {
  const { quizId } = useParams()
  const bundle = getMockQuizEditBundle(quizId)
  const materialId = bundle.materialId
  const initialQuestions = bundle.questions
  const initialActiveQuestionId = bundle.initialActiveQuestionId

  return (
    <div className="edu-quiz-create-page">
      <header className="edu-quiz-create-page__header">
        <h1 className="edu-quiz-create-page__title">퀴즈 수정</h1>
        <p className="edu-quiz-create-page__meta">
          <span className="edu-quiz-create-page__meta-label">퀴즈 ID</span>{' '}
          <code className="edu-quiz-create-page__meta-code">{quizId ?? '—'}</code>
          <span className="edu-quiz-create-page__meta-sep" aria-hidden>
            {' · '}
          </span>
          <span className="edu-quiz-create-page__meta-label">교안 ID</span>{' '}
          <code className="edu-quiz-create-page__meta-code">{materialId}</code>
        </p>
      </header>
      <QuizEditContent
        quizId={quizId ?? ''}
        materialId={materialId}
        initialQuestions={initialQuestions}
        initialActiveQuestionId={initialActiveQuestionId}
      />
    </div>
  )
}

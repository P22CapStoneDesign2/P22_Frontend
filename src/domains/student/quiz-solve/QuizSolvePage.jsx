import { useParams } from 'react-router-dom'
import QuizSolveContent from './QuizSolveContent.jsx'
import './QuizSolvePage.css'

export default function QuizSolvePage() {
  const { materialId } = useParams()
  const mid = materialId ?? ''

  return (
    <div className="edu-quiz-solve-page">
      <header className="edu-quiz-solve-page__header">
        <h1 className="edu-quiz-solve-page__title">퀴즈 풀이</h1>
        <p className="edu-quiz-solve-page__meta">
          <span className="edu-quiz-solve-page__meta-label">교안 ID</span>{' '}
          <code className="edu-quiz-solve-page__meta-code">{mid || '—'}</code>
        </p>
      </header>
      <QuizSolveContent key={mid} materialId={mid} />
    </div>
  )
}

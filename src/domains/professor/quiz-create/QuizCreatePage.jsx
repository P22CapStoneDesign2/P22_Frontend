import { useParams } from 'react-router-dom'
import QuizCreateContent from './QuizCreateContent.jsx'
import './QuizCreatePage.css'

export default function QuizCreatePage() {
  const { materialId } = useParams()
  const mid = materialId ?? ''

  return (
    <div className="edu-quiz-create-page">
      <header className="edu-quiz-create-page__header">
        <h1 className="edu-quiz-create-page__title">퀴즈 생성</h1>
        <p className="edu-quiz-create-page__meta">
          <span className="edu-quiz-create-page__meta-label">연결된 교안 ID</span>{' '}
          <code className="edu-quiz-create-page__meta-code">{mid || '—'}</code>
        </p>
      </header>
      <QuizCreateContent materialId={mid} />
    </div>
  )
}

import { useParams } from 'react-router-dom'
import QuizResultContent from './QuizResultContent.jsx'
import './QuizResultPage.css'

export default function QuizResultPage() {
  const { attemptId } = useParams()
  const aid = attemptId ?? ''

  return (
    <div className="edu-quiz-result-page">
      <header className="edu-quiz-result-page__header">
        <h1 className="edu-quiz-result-page__title">퀴즈 결과</h1>
        <p className="edu-quiz-result-page__meta">
          <span className="edu-quiz-result-page__meta-label">응시 ID</span>{' '}
          <code className="edu-quiz-result-page__meta-code">{aid || '—'}</code>
        </p>
      </header>
      <QuizResultContent key={aid} attemptId={aid} />
    </div>
  )
}

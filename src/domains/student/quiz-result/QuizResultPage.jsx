import { useParams } from 'react-router-dom'
import { useMaterialDisplayTitle } from '../../catalog/useMaterialDisplayTitle.js'
import { loadStudentQuizAttempt } from '../quiz/studentQuizData.js'
import QuizResultContent from './QuizResultContent.jsx'
import './QuizResultPage.css'

export default function QuizResultPage() {
  const { attemptId } = useParams()
  const aid = attemptId ?? ''
  const attempt = loadStudentQuizAttempt(aid)
  const materialLabel = useMaterialDisplayTitle(attempt?.materialId ?? '')

  return (
    <div className="edu-quiz-result-page">
      <header className="edu-quiz-result-page__header">
        <h1 className="edu-quiz-result-page__title">퀴즈 결과</h1>
        {materialLabel ? (
          <p className="edu-quiz-result-page__meta">
            <span className="edu-quiz-result-page__meta-label">교안</span>{' '}
            <span className="edu-quiz-result-page__meta-value">{materialLabel}</span>
          </p>
        ) : null}
      </header>
      <QuizResultContent key={aid} attemptId={aid} />
    </div>
  )
}

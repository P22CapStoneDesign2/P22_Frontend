import { useParams } from 'react-router-dom'
import QuizCreateContent from './QuizCreateContent.jsx'
import { getMaterialDisplayLabel } from '../materials/professorMaterialsStorage.js'
import { useIsViewerMode } from '../../../shared/auth/useUserRole.js'
import './QuizCreatePage.css'

export default function QuizCreatePage() {
  const { materialId } = useParams()
  const { isViewerMode } = useIsViewerMode()
  const mid = materialId ?? ''
  const materialLabel = getMaterialDisplayLabel(mid)

  return (
    <div className="edu-quiz-create-page">
      <header className="edu-quiz-create-page__header">
        <h1 className="edu-quiz-create-page__title">{isViewerMode ? '퀴즈 보기' : '퀴즈 생성'}</h1>
        <p className="edu-quiz-create-page__meta">
          <span className="edu-quiz-create-page__meta-label">교안</span>{' '}
          <span className="edu-quiz-create-page__meta-v">{materialLabel}</span>
        </p>
      </header>
      <QuizCreateContent materialId={mid} />
    </div>
  )
}

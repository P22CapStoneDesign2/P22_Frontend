import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import QuizCreateContent from './QuizCreateContent.jsx'
import './QuizCreatePage.css'

/**
 * 퀴즈 생성 라우트 셸: 레이아웃·제목·materialId 표시만 담당
 * 상태·이벤트·모달은 QuizCreateContent
 */
export default function QuizCreatePage() {
  const { materialId } = useParams()
  const navigate = useNavigate()

  return (
    <AppLayout
      headerProps={{
        userEmail: 'professor@school.edu',
        onLogout: () => navigate('/professor'),
        logoHref: '/professor',
        logoLabel: 'EDU HUB',
        breadcrumbItems: [
          { label: '교안별 퀴즈 관리', to: '/professor/quizzes' },
          { label: '퀴즈 생성' },
        ],
      }}
      contentClassName="edu-quiz-create-app-layout-content"
    >
      <div className="edu-quiz-create-page">
        <header className="edu-quiz-create-page__header">
          <h1 className="edu-quiz-create-page__title">퀴즈 생성</h1>
          <p className="edu-quiz-create-page__meta">
            <span className="edu-quiz-create-page__meta-label">연결된 교안 ID</span>{' '}
            <code className="edu-quiz-create-page__meta-code">{materialId ?? '—'}</code>
          </p>
        </header>
        <QuizCreateContent materialId={materialId ?? ''} />
      </div>
    </AppLayout>
  )
}

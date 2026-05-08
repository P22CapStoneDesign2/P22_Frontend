import { useNavigate } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import QuizMaterialSelectContent from './QuizMaterialSelectContent.jsx'
import './QuizMaterialSelectPage.css'

/**
 * 학생용: 퀴즈 풀기 전 강의·교안 선택 (/student/quiz/materials)
 */
export default function QuizMaterialSelectPage() {
  const navigate = useNavigate()

  return (
    <AppLayout
      headerProps={{
        userEmail: 'student@school.edu',
        onLogout: () => navigate('/student'),
        logoHref: '/student',
        logoLabel: 'EDU HUB',
      }}
      contentClassName="edu-stu-quiz-mat-app-layout-content"
    >
      <QuizMaterialSelectContent />
    </AppLayout>
  )
}

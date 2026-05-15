import DashboardPageLayout from '../shared/DashboardPageLayout.jsx'
import { ROUTES } from '../../shared/constants/routes.js'

const STUDENT_MENU_ITEMS = [
  {
    id: 'materials-view',
    title: '교안 보기',
    to: ROUTES.studentMaterials,
    icon: '📖',
  },
  {
    id: 'quiz-solve',
    title: '퀴즈 풀기',
    to: ROUTES.studentQuizMaterials,
    icon: '✏️',
  },
]

export default function StudentDashboardPage() {
  return (
    <DashboardPageLayout
      heading="메뉴를 선택하세요"
      headerProps={{
        userEmail: 'student@school.edu',
        onLogout: () => {},
        logoHref: '/student',
      }}
      menuItems={STUDENT_MENU_ITEMS}
    />
  )
}

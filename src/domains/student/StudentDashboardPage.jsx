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
  {
    id: 'course-apply',
    title: '강의 신청',
    to: ROUTES.studentCourseApply,
    icon: '📚',
  },
]

export default function StudentDashboardPage() {
  return <DashboardPageLayout menuItems={STUDENT_MENU_ITEMS} />
}

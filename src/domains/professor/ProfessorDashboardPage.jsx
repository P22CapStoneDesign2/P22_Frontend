import DashboardPageLayout from '../shared/DashboardPageLayout.jsx'
import { ROUTES } from '../../shared/constants/routes.js'

const PROFESSOR_MENU_ITEMS = [
  {
    id: 'quiz-manage',
    title: '교안별 퀴즈 관리',
    to: ROUTES.professorQuizzes,
    icon: '❓',
  },
  {
    id: 'material-manage',
    title: '교안 관리',
    to: ROUTES.professorMaterials,
    icon: '📄',
  },
]

export default function ProfessorDashboardPage() {
  return (
    <DashboardPageLayout heading="메뉴를 선택하세요" menuItems={PROFESSOR_MENU_ITEMS} />
  )
}

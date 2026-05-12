import DashboardPageLayout from '../shared/DashboardPageLayout.jsx'

const PROFESSOR_MENU_ITEMS = [
  {
    id: 'quiz-manage',
    title: '교안별 퀴즈 관리',
    to: '/professor/quizzes',
    icon: '❓',
  },
  {
    id: 'material-manage',
    title: '교안 관리',
    to: '/professor/materials',
    icon: '📄',
  },
]

export default function ProfessorDashboardPage() {
  return (
    <DashboardPageLayout
      heading="메뉴를 선택하세요"
      headerProps={{
        userEmail: 'professor@school.edu',
        onLogout: () => {},
        logoHref: '/professor',
        logoLabel: 'EDU HUB',
      }}
      menuItems={PROFESSOR_MENU_ITEMS}
    />
  )
}

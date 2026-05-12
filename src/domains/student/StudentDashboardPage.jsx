import DashboardPageLayout from '../shared/DashboardPageLayout.jsx'

const STUDENT_MENU_ITEMS = [
  {
    id: 'materials-view',
    title: '교안 보기',
    to: '/student/materials',
    icon: '📖',
  },
  {
    id: 'quiz-solve',
    title: '퀴즈 풀기',
    to: '/student/quiz/materials',
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

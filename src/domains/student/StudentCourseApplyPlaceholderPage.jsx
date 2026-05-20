import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout/AppLayout.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import { ROUTES } from '../../shared/constants/routes.js'
import './StudentCourseApplyPlaceholderPage.css'

/**
 * 과목 신청 임시 화면 — 본 기능은 추후 담당자 구현 예정
 */
export default function StudentCourseApplyPlaceholderPage() {
  const navigate = useNavigate()

  return (
    <AppLayout
      headerProps={{
        userEmail: 'student@school.edu',
        onLogout: () => {},
        logoHref: '/student',
        logoLabel: 'EDU HUB',
        logoImageOnly: true,
      }}
      contentClassName="edu-student-course-apply-placeholder-app-layout-content"
    >
      <div className="edu-student-course-apply-placeholder">
        <h1 className="edu-student-course-apply-placeholder__title">과목 신청</h1>
        <p className="edu-student-course-apply-placeholder__desc">
          이 화면은 준비 중입니다. 과목 신청 기능은 곧 제공될 예정입니다.
        </p>
        <Button type="button" variant="primary" onClick={() => navigate(ROUTES.studentDashboard)}>
          대시보드로 돌아가기
        </Button>
      </div>
    </AppLayout>
  )
}

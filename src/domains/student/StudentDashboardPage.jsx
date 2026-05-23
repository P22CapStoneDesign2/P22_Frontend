import { useCallback, useMemo } from 'react'
import DashboardPageLayout from '../shared/DashboardPageLayout.jsx'
import { ROUTES } from '../../shared/constants/routes.js'

const STUDENT_NAV_MENU_ITEMS = [
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

const COURSE_APPLY_PREP_MESSAGE = '강의 신청 화면은 준비 중입니다.'

export default function StudentDashboardPage() {
  /** 추후 ROUTES에 강의 신청 경로가 추가되면 navigate로 연결 */
  const handleCourseApplyClick = useCallback(() => {
    window.alert(COURSE_APPLY_PREP_MESSAGE)
  }, [])

  const menuItems = useMemo(
    () => [
      ...STUDENT_NAV_MENU_ITEMS,
      {
        id: 'course-apply',
        title: '강의 신청',
        icon: '📚',
        onClick: handleCourseApplyClick,
      },
    ],
    [handleCourseApplyClick],
  )

  return (
    <DashboardPageLayout heading="메뉴를 선택하세요" menuItems={menuItems} />
  )
}

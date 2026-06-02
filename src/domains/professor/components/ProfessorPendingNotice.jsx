import './ProfessorPendingNotice.css'

/**
 * PROF status=PENDING — lesson/quiz 생성 API 호출 전 안내 (403 선제 방지)
 */
export default function ProfessorPendingNotice({ className = '' }) {
  return (
    <p className={`edu-prof-pending-notice ${className}`.trim()} role="status">
      관리자 승인 대기 중입니다. 승인 완료 후 강의·교안·퀴즈를 생성·수정할 수 있습니다.
    </p>
  )
}

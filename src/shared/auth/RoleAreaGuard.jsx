import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoleHomePath } from '../navigation/getRoleHomePath.js'
import { useUserRole } from './useUserRole.js'
import {
  getStoredUserRole,
  isProfessorRole,
  isStudentRole,
  normalizeUserRole,
} from './roleUtils.js'

const ACCESS_DENIED_MESSAGE = '접근 권한이 없는 화면입니다.'

/**
 * @param {object} props
 * @param {'professor' | 'student' | 'admin'} props.area
 * @param {import('react').ReactNode} props.children
 */
export default function RoleAreaGuard({ area, children }) {
  const navigate = useNavigate()
  const { role, loading } = useUserRole()
  const redirectedRef = useRef(false)

  const effectiveRole = normalizeUserRole(role || getStoredUserRole())

  const allowed =
    area === 'professor'
      ? isProfessorRole(effectiveRole)
      : area === 'student'
        ? isStudentRole(effectiveRole)
        : area === 'admin'
          ? effectiveRole === 'ADMIN'
          : false

  useEffect(() => {
    if (loading || allowed || redirectedRef.current) return
    redirectedRef.current = true
    window.alert(ACCESS_DENIED_MESSAGE)
    navigate(getRoleHomePath(effectiveRole), { replace: true })
  }, [allowed, effectiveRole, loading, navigate])

  if (loading) {
    return (
      <p className="edu-role-guard-loading" role="status">
        접근 권한을 확인하는 중…
      </p>
    )
  }

  if (!allowed) {
    return null
  }

  return children
}

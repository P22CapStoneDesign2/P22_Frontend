import { useEffect, useState } from 'react'
import { getMe } from '../../api/auth.js'
import {
  getStoredUserRole,
  isStudentRole,
  normalizeUserRole,
  setStoredUserRole,
} from './roleUtils.js'

/**
 * GET /api/users/me 기반 role. 실패 시 sessionStorage 캐시 유지.
 * @returns {{ role: string, loading: boolean, error: unknown | null }}
 */
export function useUserRole() {
  const [role, setRole] = useState(() => getStoredUserRole())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    getMe()
      .then((res) => {
        if (cancelled) return
        const next = normalizeUserRole(res.data?.data?.role)
        setStoredUserRole(next)
        setRole(next)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { role, loading, error }
}

/**
 * 학생(USER/STUDENT)이면 퀴즈·교안 보기 전용 모드
 */
export function useIsViewerMode() {
  const { role, loading, error } = useUserRole()
  return {
    isViewerMode: isStudentRole(role),
    role,
    loading,
    error,
  }
}

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUserRole } from '../auth/roleUtils.js'
import { getRoleHomePath } from './getRoleHomePath.js'

/**
 * @param {string} [fallbackPath] history 없을 때 이동 경로 (없으면 role 기준 홈)
 */
export function usePageBackNavigation(fallbackPath) {
  const navigate = useNavigate()

  return useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1)
      return
    }
    const home = fallbackPath ?? getRoleHomePath(getStoredUserRole())
    navigate(home)
  }, [navigate, fallbackPath])
}

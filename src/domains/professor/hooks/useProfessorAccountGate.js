import { useEffect, useState } from 'react'
import { getMe } from '../../../api/auth.js'
import { apiResponseData } from '../../../api/apiResponse.js'

/**
 * 교수 계정 승인 상태 — GET /api/users/me (auth 모듈·인터셉터는 수정하지 않음)
 * @returns {{ loading: boolean, status: string|null, isProfessorPending: boolean, canMutateProfessorContent: boolean }}
 */
export function useProfessorAccountGate() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let cancelled = false

    getMe()
      .then((res) => {
        if (cancelled) return
        const data = apiResponseData(res)
        const next = data?.status != null ? String(data.status) : null
        setStatus(next)
      })
      .catch(() => {
        if (!cancelled) setStatus(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const isProfessorPending = status === 'PENDING'

  return {
    loading,
    status,
    isProfessorPending,
    canMutateProfessorContent: !isProfessorPending,
  }
}

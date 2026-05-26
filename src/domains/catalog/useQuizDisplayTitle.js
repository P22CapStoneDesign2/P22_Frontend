import { useEffect, useState } from 'react'
import { fetchQuizDetailData, fetchQuizForEditData } from '../quiz/api/quizApi.js'

/**
 * 퀴즈 화면 메타 라벨 — GET /api/quiz/{quizId} 또는 /edit 만 사용 (lessons API 금지).
 *
 * @param {string|undefined|null} quizId
 * @param {{ forEdit?: boolean }} [options]
 */
export function useQuizDisplayTitle(quizId, options = {}) {
  const id = String(quizId ?? '').trim()
  const { forEdit = false } = options
  const [label, setLabel] = useState('—')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const data = forEdit ? await fetchQuizForEditData(id) : await fetchQuizDetailData(id)
        if (cancelled || !data || typeof data !== 'object') return
        const materialTitle =
          typeof data.materialTitle === 'string' ? data.materialTitle.trim() : ''
        const quizTitle = typeof data.title === 'string' ? data.title.trim() : ''
        setLabel(materialTitle || quizTitle || `퀴즈 #${id}`)
      } catch {
        if (!cancelled) setLabel('—')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, forEdit])

  return id ? label : '—'
}

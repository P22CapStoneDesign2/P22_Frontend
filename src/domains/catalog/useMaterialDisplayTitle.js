import { useEffect, useState } from 'react'
import { fetchMaterialTitle } from './lessonCatalogService.js'

/**
 * 교안(LessonMaterial) 표시명 — lessonId·materialId 둘 다 있을 때만 materials API 호출.
 * quizId 단독으로 호출하지 말 것 (GET /api/lessons/{quizId} 404 방지).
 *
 * @param {string|undefined|null} lessonId — 강의 PK
 * @param {string|undefined|null} materialId — 교안 PK
 */
export function useMaterialDisplayTitle(lessonId, materialId) {
  const lid = String(lessonId ?? '').trim()
  const mid = String(materialId ?? '').trim()
  const [label, setLabel] = useState('—')

  useEffect(() => {
    if (!lid || !mid) return
    let cancelled = false
    fetchMaterialTitle(lid, mid).then((title) => {
      if (!cancelled) setLabel(title)
    })
    return () => {
      cancelled = true
    }
  }, [lid, mid])

  if (!lid || !mid) return '—'
  return label
}

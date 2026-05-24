import { useEffect, useState } from 'react'
import { fetchLessonDetail, fetchLessonTitle } from './lessonCatalogService.js'

/**
 * 라우트 `:materialId` / `:lessonId` 슬롯 — 명세상 교안(lesson) ID
 * @param {string|undefined|null} lessonOrQuizContextId — lessonId 우선, 없으면 quiz의 lessonId는 호출부에서 전달
 * @param {string|undefined|null} [lessonIdHint] 퀴즈 화면 등에서 lessonId를 알 때
 */
export function useLessonTitle(lessonOrQuizContextId, lessonIdHint) {
  const lessonId = String(lessonIdHint ?? lessonOrQuizContextId ?? '').trim()
  const [label, setLabel] = useState('—')

  useEffect(() => {
    if (!lessonId) return
    let cancelled = false
    fetchLessonTitle(lessonId).then((title) => {
      if (!cancelled) setLabel(title)
    })
    return () => {
      cancelled = true
    }
  }, [lessonId])

  return lessonId ? label : '—'
}

/** @deprecated useLessonTitle — lessonId 기준 */
export function useMaterialDisplayTitle(lessonId) {
  return useLessonTitle(lessonId)
}

export { fetchLessonDetail }

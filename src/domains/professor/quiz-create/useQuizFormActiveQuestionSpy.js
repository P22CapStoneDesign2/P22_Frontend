import { useCallback, useEffect, useRef } from 'react'

const PROGRAMMATIC_SCROLL_MS = 450

/**
 * 문제 카드 스크롤 시 우측 네비 activeQuestionId 동기화 (IntersectionObserver)
 *
 * @param {object} params
 * @param {Array<{ id: string }>} params.questions
 * @param {import('react').RefObject<Record<string, HTMLElement | null>>} params.formRefs
 * @param {(id: string) => void} params.onActiveQuestionChange
 * @param {boolean} [params.enabled]
 */
export function useQuizFormActiveQuestionSpy({
  questions,
  formRefs,
  onActiveQuestionChange,
  enabled = true,
}) {
  const ratiosRef = useRef(new Map())
  const isProgrammaticScrollRef = useRef(false)
  const programmaticTimerRef = useRef(null)
  const onChangeRef = useRef(onActiveQuestionChange)

  useEffect(() => {
    onChangeRef.current = onActiveQuestionChange
  }, [onActiveQuestionChange])

  const markProgrammaticScroll = useCallback(() => {
    isProgrammaticScrollRef.current = true
    if (programmaticTimerRef.current != null) {
      window.clearTimeout(programmaticTimerRef.current)
    }
    programmaticTimerRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false
      programmaticTimerRef.current = null
    }, PROGRAMMATIC_SCROLL_MS)
  }, [])

  useEffect(() => {
    if (!enabled || questions.length === 0) return undefined

    const pickMostVisible = () => {
      if (isProgrammaticScrollRef.current) return

      let bestId = questions[0]?.id ?? ''
      let bestRatio = -1

      for (const q of questions) {
        const ratio = ratiosRef.current.get(q.id) ?? 0
        if (ratio > bestRatio) {
          bestRatio = ratio
          bestId = q.id
        }
      }

      if (bestRatio > 0 && bestId) {
        onChangeRef.current(bestId)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-question-id')
          if (!id) return
          ratiosRef.current.set(id, entry.isIntersecting ? entry.intersectionRatio : 0)
        })
        pickMostVisible()
      },
      {
        root: null,
        rootMargin: '-15% 0px -50% 0px',
        threshold: [0, 0.05, 0.15, 0.35, 0.55, 0.75, 1],
      },
    )

    const observeAll = () => {
      questions.forEach((q) => {
        const el = formRefs.current[q.id]
        if (el) observer.observe(el)
      })
    }

    observeAll()
    const raf = requestAnimationFrame(observeAll)

    const ratios = ratiosRef.current

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      ratios.clear()
    }
  }, [questions, enabled, formRefs])

  useEffect(
    () => () => {
      if (programmaticTimerRef.current != null) {
        window.clearTimeout(programmaticTimerRef.current)
      }
    },
    [],
  )

  return { markProgrammaticScroll }
}

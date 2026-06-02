import { useEffect, useRef, useState } from 'react'
import { isLandingDockScrollLocked } from './landingDockScrollLock.js'

const LANDING_SCROLL_SELECTOR = '.landing-scroll'
const VISIBLE_RATIO_THRESHOLD = 0.25

/**
 * @param {object} props
 * @param {string} props.text
 * @param {string} [props.className]
 * @param {number} [props.charDelayMs]
 */
export default function LandingTypewriterText({ text, className = '', charDelayMs = 70 }) {
  const rootRef = useRef(null)
  const timeoutRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null))
  const leaveTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null))
  const isCompleteRef = useRef(false)
  const displayedRef = useRef('')
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    isCompleteRef.current = isComplete
  }, [isComplete])

  useEffect(() => {
    displayedRef.current = displayed
  }, [displayed])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let cancelled = false
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const clearTypingTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const clearLeaveTimer = () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current)
        leaveTimerRef.current = null
      }
    }

    const resetTyping = () => {
      clearTypingTimer()
      isCompleteRef.current = false
      displayedRef.current = ''
      setDisplayed('')
      setIsTyping(false)
      setIsComplete(false)
    }

    const runTyping = () => {
      if (cancelled) return

      if (prefersReducedMotion) {
        isCompleteRef.current = true
        displayedRef.current = text
        setDisplayed(text)
        setIsTyping(false)
        setIsComplete(true)
        return
      }

      if (isCompleteRef.current && displayedRef.current === text) return

      clearTypingTimer()
      setIsTyping(true)
      isCompleteRef.current = false
      displayedRef.current = ''
      setDisplayed('')
      setIsComplete(false)

      let index = 0

      const tick = () => {
        if (cancelled) return
        index += 1
        const next = text.slice(0, index)
        displayedRef.current = next
        setDisplayed(next)
        if (index >= text.length) {
          isCompleteRef.current = true
          setIsTyping(false)
          setIsComplete(true)
          clearTypingTimer()
          return
        }
        timeoutRef.current = setTimeout(tick, charDelayMs)
      }

      timeoutRef.current = setTimeout(tick, charDelayMs)
    }

    const syncWithViewport = () => {
      if (cancelled || !root) return
      const scrollRoot = getLandingScrollRoot()
      const ratio = getVisibleRatioInRoot(root, scrollRoot)
      if (ratio >= VISIBLE_RATIO_THRESHOLD) {
        clearLeaveTimer()
        runTyping()
      } else if (!isLandingDockScrollLocked()) {
        resetTyping()
      }
    }

    if (prefersReducedMotion) {
      setDisplayed(text)
      setIsComplete(true)
      return () => {
        cancelled = true
      }
    }

    const scrollRoot = getLandingScrollRoot()
    const observer = new IntersectionObserver(
      (entries) => {
        if (cancelled || isLandingDockScrollLocked()) return
        const entry = entries.find((item) => item.target === root)
        if (!entry) return

        if (entry.isIntersecting) {
          clearLeaveTimer()
          runTyping()
        } else {
          clearLeaveTimer()
          leaveTimerRef.current = setTimeout(() => {
            if (cancelled || isLandingDockScrollLocked()) return
            resetTyping()
          }, 280)
        }
      },
      {
        root: scrollRoot,
        threshold: VISIBLE_RATIO_THRESHOLD,
      },
    )

    const onDockScrollEnd = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          syncWithViewport()
        })
      })
    }

    observer.observe(root)
    window.addEventListener('landing-dock-scroll-end', onDockScrollEnd)

    return () => {
      cancelled = true
      observer.disconnect()
      window.removeEventListener('landing-dock-scroll-end', onDockScrollEnd)
      clearTypingTimer()
      clearLeaveTimer()
    }
  }, [text, charDelayMs])

  return (
    <span ref={rootRef} className={`landing-bridge__typewriter ${className}`.trim()} aria-label={text}>
      <span className="landing-bridge__typewriter-placeholder" aria-hidden="true">
        {text}
      </span>
      <span className="landing-bridge__typewriter-layer" aria-hidden="true">
        <span className="landing-bridge__typewriter-text">{displayed}</span>
        {isTyping || isComplete ? (
          <span className="landing-bridge__typewriter-cursor" aria-hidden="true" />
        ) : null}
      </span>
    </span>
  )
}

function getLandingScrollRoot() {
  return document.querySelector(LANDING_SCROLL_SELECTOR)
}

/** @param {HTMLElement} el @param {Element | null} root */
function getVisibleRatioInRoot(el, root) {
  if (!root) return 0
  const elRect = el.getBoundingClientRect()
  const rootRect = root.getBoundingClientRect()
  const visible = Math.min(elRect.bottom, rootRect.bottom) - Math.max(elRect.top, rootRect.top)
  if (visible <= 0) return 0
  return visible / Math.max(elRect.height, 1)
}

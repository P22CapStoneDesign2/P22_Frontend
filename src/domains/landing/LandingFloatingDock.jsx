import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  beginLandingDockScroll,
  endLandingDockScroll,
  isLandingDockScrollLocked,
} from './landingDockScrollLock.js'
import './LandingFloatingDock.css'

/** @typedef {'intro' | 'mindmap' | 'start'} DockSection */

const DOCK_ITEMS = [
  {
    section: 'intro',
    label: '소개',
    targetId: 'landing-intro',
    scrollAnchor: 'top',
  },
  { section: 'mindmap', label: '알아보기', targetId: 'landing-mindmap', scrollAnchor: 'upper' },
  {
    section: 'start',
    label: '시작하기',
    targetId: 'landing-start',
    scrollAnchor: 'bottom',
  },
]

/** @typedef {'top' | 'alignTop' | 'upper' | 'lower' | 'bottom'} DockScrollAnchor */

/**
 * @param {HTMLElement} scroller
 * @param {DockScrollAnchor} scrollAnchor
 */
function getViewportOffset(scroller, scrollAnchor) {
  if (scrollAnchor === 'bottom' || scrollAnchor === 'top') return 0
  if (scrollAnchor === 'alignTop') return scroller.clientHeight * 0.04
  if (scrollAnchor === 'lower') return scroller.clientHeight * 0.58
  return scroller.clientHeight * 0.22
}

/**
 * @param {HTMLElement} scroller
 * @param {() => void} onSettled
 * @returns {() => void}
 */
function waitForScrollSettled(scroller, onSettled) {
  let settledTimer = /** @type {ReturnType<typeof setTimeout> | null} */ (null)
  let maxTimer = /** @type {ReturnType<typeof setTimeout> | null} */ (null)
  let sawScroll = false

  const finish = () => {
    scroller.removeEventListener('scroll', onScroll)
    if (settledTimer) clearTimeout(settledTimer)
    if (maxTimer) clearTimeout(maxTimer)
    onSettled()
  }

  const onScroll = () => {
    sawScroll = true
    if (settledTimer) clearTimeout(settledTimer)
    settledTimer = setTimeout(finish, 160)
  }

  scroller.addEventListener('scroll', onScroll, { passive: true })
  settledTimer = setTimeout(() => {
    if (!sawScroll) finish()
  }, 240)
  maxTimer = setTimeout(finish, 3000)

  return finish
}

/**
 * @param {string} id
 * @param {DockScrollAnchor} [scrollAnchor]
 */
function scrollToId(id, scrollAnchor = 'upper') {
  const scroller = document.querySelector('.landing-scroll')
  if (!scroller) return

  scroller.scrollTo({ top: scroller.scrollTop, behavior: 'auto' })

  const maxTop = scroller.scrollHeight - scroller.clientHeight

  if (scrollAnchor === 'bottom') {
    requestAnimationFrame(() => {
      scroller.scrollTo({ top: maxTop, behavior: 'smooth' })
    })
    return
  }

  if (scrollAnchor === 'top') {
    requestAnimationFrame(() => {
      scroller.scrollTo({ top: 0, behavior: 'smooth' })
    })
    return
  }

  const target = document.getElementById(id)
  if (!target) return

  const viewportOffset = getViewportOffset(scroller, scrollAnchor)

  requestAnimationFrame(() => {
    const top = Math.min(
      maxTop,
      Math.max(
        0,
        target.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop -
          viewportOffset,
      ),
    )
    scroller.scrollTo({ top, behavior: 'smooth' })
  })
}

/** @param {HTMLElement} scroller */
function resolveActiveFromScroll(scroller) {
  const nearBottom =
    scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop < 120
  if (nearBottom) return /** @type {DockSection} */ ('start')

  const anchorY = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.28
  let section = DOCK_ITEMS[0].section

  for (const item of DOCK_ITEMS) {
    const el = document.getElementById(item.targetId)
    if (!el) continue
    if (el.getBoundingClientRect().top <= anchorY) section = item.section
  }

  return section
}

export default function LandingFloatingDock() {
  const [active, setActive] = useState(/** @type {DockSection} */ ('intro'))
  const [selection, setSelection] = useState({ top: 0, height: 0 })
  const raftRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const itemRefs = useRef(/** @type {Partial<Record<DockSection, HTMLButtonElement | null>>} */ ({}))
  const scrollEndCleanupRef = useRef(/** @type {(() => void) | null} */ (null))

  const measureSelection = useCallback((section) => {
    const raft = raftRef.current
    const button = itemRefs.current[section]
    if (!raft || !button) return

    const raftRect = raft.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    setSelection({
      top: buttonRect.top - raftRect.top,
      height: buttonRect.height,
    })
  }, [])

  useLayoutEffect(() => {
    measureSelection(active)
    const onResize = () => measureSelection(active)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [active, measureSelection])

  useEffect(() => {
    const scroller = document.querySelector('.landing-scroll')
    if (!scroller) return

    const syncActiveFromScroll = () => {
      if (isLandingDockScrollLocked()) return
      const next = resolveActiveFromScroll(scroller)
      setActive((prev) => (prev === next ? prev : next))
    }

    scroller.addEventListener('scroll', syncActiveFromScroll, { passive: true })
    window.addEventListener('resize', syncActiveFromScroll)
    syncActiveFromScroll()

    return () => {
      scroller.removeEventListener('scroll', syncActiveFromScroll)
      window.removeEventListener('resize', syncActiveFromScroll)
      scrollEndCleanupRef.current?.()
      scrollEndCleanupRef.current = null
      endLandingDockScroll()
    }
  }, [])

  function goTo(section, targetId, scrollAnchor) {
    const scroller = document.querySelector('.landing-scroll')
    if (!scroller) return

    scrollEndCleanupRef.current?.()
    scrollEndCleanupRef.current = null

    setActive(section)
    beginLandingDockScroll()

    scrollToId(targetId, scrollAnchor)

    scrollEndCleanupRef.current = waitForScrollSettled(scroller, () => {
      scrollEndCleanupRef.current = null
      endLandingDockScroll()
      measureSelection(section)
      const next = resolveActiveFromScroll(scroller)
      setActive(next)
    })

    requestAnimationFrame(() => measureSelection(section))
  }

  return (
    <aside className="landing-dock" aria-label="빠른 이동">
      <div className="landing-dock__bob">
        <div ref={raftRef} className="landing-dock__raft">
          <span
            className="landing-dock__selection"
            style={{
              '--sel-top': `${selection.top}px`,
              '--sel-height': `${selection.height}px`,
            }}
            aria-hidden="true"
          />

          <nav className="landing-dock__panel" aria-label="EDU HUB 메뉴">
            {DOCK_ITEMS.map((item) => {
              const isActive = active === item.section
              return (
                <button
                  key={item.section}
                  ref={(node) => {
                    itemRefs.current[item.section] = node
                  }}
                  type="button"
                  className={[
                    'landing-dock__item',
                    item.section === 'intro' && 'landing-dock__item--brand',
                    item.section === 'start' && 'landing-dock__item--cta',
                    isActive && 'landing-dock__item--active',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => goTo(item.section, item.targetId, item.scrollAnchor)}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}

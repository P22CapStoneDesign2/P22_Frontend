import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './LandingFloatingDock.css'

/** @typedef {'intro' | 'mindmap' | 'start'} DockSection */

const DOCK_ITEMS = [
  { section: 'intro', label: '소개', targetId: 'landing-bridge', scrollAnchor: 'upper' },
  { section: 'mindmap', label: '알아보기', targetId: 'landing-mindmap', scrollAnchor: 'upper' },
  {
    section: 'start',
    label: '시작하기',
    targetId: 'landing-start',
    scrollAnchor: 'bottom',
  },
]

/** @typedef {'upper' | 'lower' | 'bottom'} DockScrollAnchor */

/**
 * @param {string} id
 * @param {DockScrollAnchor} [scrollAnchor]
 */
function scrollToId(id, scrollAnchor = 'upper') {
  const scroller = document.querySelector('.landing-scroll')
  if (!scroller) return

  const maxTop = scroller.scrollHeight - scroller.clientHeight

  if (scrollAnchor === 'bottom') {
    scroller.scrollTo({ top: maxTop, behavior: 'smooth' })
    return
  }

  const target = document.getElementById(id)
  if (!target) return

  const viewportOffset =
    scrollAnchor === 'lower' ? scroller.clientHeight * 0.58 : scroller.clientHeight * 0.22

  const top =
    target.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top +
    scroller.scrollTop -
    viewportOffset

  scroller.scrollTo({ top: Math.min(maxTop, Math.max(0, top)), behavior: 'smooth' })
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
  const scrollLockRef = useRef(false)
  const scrollLockTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null))

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
      if (scrollLockRef.current) return
      const next = resolveActiveFromScroll(scroller)
      setActive((prev) => (prev === next ? prev : next))
    }

    scroller.addEventListener('scroll', syncActiveFromScroll, { passive: true })
    window.addEventListener('resize', syncActiveFromScroll)
    syncActiveFromScroll()

    return () => {
      scroller.removeEventListener('scroll', syncActiveFromScroll)
      window.removeEventListener('resize', syncActiveFromScroll)
      if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current)
    }
  }, [])

  function goTo(section, targetId, scrollAnchor) {
    setActive(section)
    scrollLockRef.current = true
    if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current)
    scrollLockTimerRef.current = setTimeout(() => {
      scrollLockRef.current = false
      scrollLockTimerRef.current = null
    }, 900)

    scrollToId(targetId, scrollAnchor)
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

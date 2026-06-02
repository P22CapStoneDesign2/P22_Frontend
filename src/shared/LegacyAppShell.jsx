/* 우측 전체 높이 툴바입니다. 공통으로 사용하면 될 듯 합니다. */

import { useEffect, useRef, useState } from 'react'
import App from '../App.jsx'
import LessonScript from '../domains/professor/page/LessonScript.jsx'
import './LegacyAppShell.css'

const VIEW_ORDER = ['lesson', 'quiz-create', 'quiz-stats', 'overview']

const VIEW_LABELS = {
  lesson: '교안 작성',
  'quiz-create': '퀴즈 생성',
  'quiz-stats': '퀴즈 통계',
  overview: '전체 조회',
}

function PlaceholderScreen({ title, description }) {
  return (
    <div className="app-placeholder">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

export default function LegacyAppShell() {
  const [view, setView] = useState('lesson')
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const onDocMouseDown = (e) => {
      const t = e.target
      if (t instanceof Node && rootRef.current?.contains(t)) return
      setMenuOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const selectView = (next) => {
    setView(next)
    setMenuOpen(false)
  }

  return (
    <div className="app-layout">
      {menuOpen ? (
        <div
          className="app-toolbar-backdrop"
          aria-hidden
          onMouseDown={(e) => {
            e.preventDefault()
            setMenuOpen(false)
          }}
        />
      ) : null}

      <div className="app-nav-shell" ref={rootRef}>
        {menuOpen ? (
          <aside
            id="app-fab-toolbar"
            className="app-fab-toolbar"
            role="toolbar"
            aria-orientation="vertical"
            aria-label="주요 화면 이동"
          >
            {VIEW_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                className={`app-fab-tool-btn${view === key ? ' app-fab-tool-btn--active' : ''}`}
                aria-current={view === key ? 'page' : undefined}
                onClick={() => selectView(key)}
              >
                {VIEW_LABELS[key]}
              </button>
            ))}
          </aside>
        ) : null}

        <div className="app-fab-root">
          <button
            type="button"
            className="app-fab-trigger"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? 'app-fab-toolbar' : undefined}
            aria-haspopup="true"
            title="메뉴"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {view === 'lesson' ? <LessonScript /> : null}
      {view === 'quiz-create' ? (
        <PlaceholderScreen title="퀴즈 생성" description="퀴즈를 만들고 편집하는 화면입니다. 서버·기능 연동은 추후 붙일 수 있어요." />
      ) : null}
      {view === 'quiz-stats' ? (
        <PlaceholderScreen title="퀴즈 통계" description="응시 결과와 통계를 보는 화면입니다. 데이터 연동은 추후 가능합니다." />
      ) : null}
      {view === 'overview' ? <App /> : null}
    </div>
  )
}

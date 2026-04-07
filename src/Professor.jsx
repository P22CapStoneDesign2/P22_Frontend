import { useCallback, useEffect, useId, useRef, useState } from 'react'
import './Professor.css'

const CATEGORIES = [
  { value: '', label: '카테고리' },
  { value: 'general', label: '일반' },
  { value: 'lecture', label: '수업 자료' },
  { value: 'assignment', label: '과제 안내' },
  { value: 'exam', label: '시험' },
]

const PARAGRAPH_STYLES = [
  { value: 'p', label: '본문' },
  { value: 'div', label: '본문2' },
  { value: 'h3', label: '소제목' },
  { value: 'h2', label: '중제목' },
  { value: 'h1', label: '큰 제목' },
]

const FONT_NAMES = [
  { value: 'Malgun Gothic', label: '기본서체' },
  { value: 'Apple SD Gothic Neo', label: '애플 고딕' },
  { value: 'Nanum Gothic', label: '나눔고딕' },
  { value: 'Nanum Myeongjo', label: '나눔명조' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: '고정폭' },
]

const EDITOR_MODES = [
  { value: 'visual', label: '기본모드' },
  { value: 'html', label: 'HTML' },
]

const EMOJI_PICK = ['😀', '📌', '✅', '❓', '💡', '📎', '⭐', '🔔', '📝', '🎯', '👍', '📚']

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function execCmd(command, value = null) {
  try {
    document.execCommand(command, false, value)
  } catch {
    /* noop */
  }
}

export default function Professor() {
  const formId = useId()
  const editorRef = useRef(null)
  const imageInputRef = useRef(null)
  const forePickerRef = useRef(null)
  const backPickerRef = useRef(null)

  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [paragraphStyle, setParagraphStyle] = useState(0)
  const [fontName, setFontName] = useState(FONT_NAMES[0].value)
  const [editorMode, setEditorMode] = useState('visual')
  const [htmlSource, setHtmlSource] = useState('')
  const [draftCount, setDraftCount] = useState(0)
  const [toast, setToast] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [bodyEmpty, setBodyEmpty] = useState(true)
  const toastTimer = useRef(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      setToast('')
      toastTimer.current = null
    }, 2600)
  }, [])

  useEffect(() => {
    const onDocMouseDown = (e) => {
      const t = e.target
      if (t instanceof Node && t.closest('.tistory-editor__popover-wrap')) return
      setShowEmoji(false)
      setShowMore(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  const focusEditor = () => {
    editorRef.current?.focus()
  }

  const handleParagraphStyle = (index) => {
    setParagraphStyle(index)
    const item = PARAGRAPH_STYLES[index]
    focusEditor()
    execCmd('formatBlock', item.value)
  }

  const handleFontChange = (name) => {
    setFontName(name)
    focusEditor()
    execCmd('fontName', name)
  }

  const insertImageFromFiles = async (files) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) return
    const maxBytes = 8 * 1024 * 1024
    if (list.some((f) => f.size > maxBytes)) {
      showToast('이미지는 파일당 8MB 이하만 넣을 수 있어요.')
      return
    }
    focusEditor()
    try {
      for (const file of list) {
        const url = await readFileAsDataURL(file)
        execCmd('insertImage', url)
      }
    } catch {
      showToast('이미지를 넣지 못했습니다.')
    }
  }

  const insertTable = () => {
    focusEditor()
    const html =
      '<table class="professor-editor-table" border="1" style="border-collapse:collapse;width:100%;margin:12px 0"><tr><td style="padding:8px;min-width:80px">&nbsp;</td><td style="padding:8px">&nbsp;</td></tr><tr><td style="padding:8px">&nbsp;</td><td style="padding:8px">&nbsp;</td></tr></table><p><br></p>'
    execCmd('insertHTML', html)
  }

  const insertLink = () => {
    focusEditor()
    const url = window.prompt('링크 URL을 입력하세요', 'https://')
    if (url) execCmd('createLink', url)
  }

  const insertHr = () => {
    focusEditor()
    execCmd('insertHorizontalRule')
  }

  const insertQuote = () => {
    focusEditor()
    execCmd('formatBlock', 'blockquote')
  }

  const insertEmoji = (ch) => {
    focusEditor()
    execCmd('insertText', ch)
    setShowEmoji(false)
  }

  const syncHtmlFromEditor = () => {
    const el = editorRef.current
    if (!el) return
    setHtmlSource(el.innerHTML)
    setBodyEmpty(el.innerText.replace(/\u00a0/g, ' ').trim().length === 0)
  }

  const handleModeChange = (mode) => {
    if (mode === 'html' && editorMode === 'visual') {
      syncHtmlFromEditor()
    }
    if (mode === 'visual' && editorMode === 'html' && editorRef.current) {
      editorRef.current.innerHTML = htmlSource || '<p><br></p>'
      queueMicrotask(() => syncHtmlFromEditor())
    }
    setEditorMode(mode)
  }

  const handleTempSave = () => {
    syncHtmlFromEditor()
    setDraftCount((n) => n + 1)
    showToast('임시저장되었습니다. (브라우저에만 보관)')
  }

  const handleComplete = () => {
    syncHtmlFromEditor()
    showToast('완료 처리되었습니다. 서버 전송은 추후 연동할 수 있어요.')
  }

  return (
    <div className="tistory-editor">
      <header className="tistory-editor__masthead">
        <span className="tistory-editor__brand">교안 작성</span>
        <div className="tistory-editor__user">
          <span className="tistory-editor__user-name">교수</span>
          <span className="tistory-editor__user-avatar" aria-hidden="true" />
        </div>
      </header>

      <div className="tistory-editor__toolbar-wrap">
        <div className="tistory-editor__toolbar" role="toolbar" aria-label="서식">
          <div className="tistory-editor__toolbar-row">
            <button
              type="button"
              className="tistory-editor__icon-btn"
              title="사진"
              aria-label="사진 넣기"
              onClick={() => imageInputRef.current?.click()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="tistory-editor__hidden-file"
              onChange={(e) => {
                insertImageFromFiles(e.target.files)
                e.target.value = ''
              }}
            />

            <select
              className="tistory-editor__toolbar-select"
              aria-label="문단 스타일"
              value={paragraphStyle}
              onChange={(e) => handleParagraphStyle(Number(e.target.value))}
            >
              {PARAGRAPH_STYLES.map((s, i) => (
                <option key={`${s.label}-${i}`} value={i}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              id={`${formId}-font`}
              className="tistory-editor__toolbar-select tistory-editor__toolbar-select--wide"
              aria-label="글꼴"
              value={fontName}
              onChange={(e) => handleFontChange(e.target.value)}
            >
              {FONT_NAMES.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            <span className="tistory-editor__toolbar-divider" aria-hidden />

            <button type="button" className="tistory-editor__fmt-btn" title="굵게" aria-label="굵게" onClick={() => { focusEditor(); execCmd('bold') }}>
              <strong>B</strong>
            </button>
            <button type="button" className="tistory-editor__fmt-btn" title="기울임" aria-label="기울임" onClick={() => { focusEditor(); execCmd('italic') }}>
              <em>I</em>
            </button>
            <button type="button" className="tistory-editor__fmt-btn" title="밑줄" aria-label="밑줄" onClick={() => { focusEditor(); execCmd('underline') }}>
              <span className="tistory-editor__u">U</span>
            </button>
            <button type="button" className="tistory-editor__fmt-btn" title="취소선" aria-label="취소선" onClick={() => { focusEditor(); execCmd('strikeThrough') }}>
              <span className="tistory-editor__strike">S</span>
            </button>

            <button
              type="button"
              className="tistory-editor__icon-btn"
              title="글자 색"
              aria-label="글자 색"
              onClick={() => forePickerRef.current?.click()}
            >
              <span className="tistory-editor__color-icon" style={{ borderBottom: '3px solid #e11d48' }}>A</span>
            </button>
            <input
              ref={forePickerRef}
              type="color"
              className="tistory-editor__color-input"
              defaultValue="#111827"
              aria-label="글자 색 선택"
              onChange={(e) => {
                focusEditor()
                execCmd('foreColor', e.target.value)
              }}
            />

            <button
              type="button"
              className="tistory-editor__icon-btn"
              title="배경 색"
              aria-label="배경 색"
              onClick={() => backPickerRef.current?.click()}
            >
              <span className="tistory-editor__hl-icon">A</span>
            </button>
            <input
              ref={backPickerRef}
              type="color"
              className="tistory-editor__color-input"
              defaultValue="#fef08a"
              aria-label="배경 색 선택"
              onChange={(e) => {
                focusEditor()
                execCmd('hiliteColor', e.target.value)
              }}
            />

            <span className="tistory-editor__toolbar-divider" aria-hidden />

            <button type="button" className="tistory-editor__icon-btn" title="왼쪽 정렬" aria-label="왼쪽 정렬" onClick={() => { focusEditor(); execCmd('justifyLeft') }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M3 5h18v2H3V5zm0 6h12v2H3v-2zm0 6h18v2H3v-2z" /></svg>
            </button>
            <button type="button" className="tistory-editor__icon-btn" title="가운데" aria-label="가운데 정렬" onClick={() => { focusEditor(); execCmd('justifyCenter') }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M3 5h18v2H3V5zm3 6h12v2H6v-2zm-3 6h18v2H3v-2z" /></svg>
            </button>
            <button type="button" className="tistory-editor__icon-btn" title="오른쪽" aria-label="오른쪽 정렬" onClick={() => { focusEditor(); execCmd('justifyRight') }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M3 5h18v2H3V5zm6 6h12v2H9v-2zm-6 6h18v2H3v-2z" /></svg>
            </button>
            <button type="button" className="tistory-editor__icon-btn" title="양쪽 정렬" aria-label="양쪽 정렬" onClick={() => { focusEditor(); execCmd('justifyFull') }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" /></svg>
            </button>

            <button type="button" className="tistory-editor__icon-btn" title="인용" aria-label="인용" onClick={insertQuote}>
              <span className="tistory-editor__quote-icon">“</span>
            </button>

            <div className="tistory-editor__popover-wrap">
              <button
                type="button"
                className="tistory-editor__icon-btn"
                title="이모지"
                aria-expanded={showEmoji}
                aria-label="이모지"
                onClick={() => {
                  setShowEmoji((v) => !v)
                  setShowMore(false)
                }}
              >
                <span className="tistory-editor__emoji-trigger">😊</span>
              </button>
              {showEmoji ? (
                <div className="tistory-editor__popover" role="listbox">
                  {EMOJI_PICK.map((ch) => (
                    <button key={ch} type="button" className="tistory-editor__emoji-item" onClick={() => insertEmoji(ch)}>
                      {ch}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button type="button" className="tistory-editor__icon-btn" title="표" aria-label="표 넣기" onClick={insertTable}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="1" />
                <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
              </svg>
            </button>

            <button type="button" className="tistory-editor__icon-btn" title="링크" aria-label="링크" onClick={insertLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
              </svg>
            </button>

            <button type="button" className="tistory-editor__icon-btn" title="글머리 기호" aria-label="글머리 기호" onClick={() => { focusEditor(); execCmd('insertUnorderedList') }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="4" cy="6" r="2" /><circle cx="4" cy="12" r="2" /><circle cx="4" cy="18" r="2" /><path d="M8 5h12v2H8V5zm0 6h12v2H8v-2zm0 6h12v2H8v-2z" /></svg>
            </button>
            <button type="button" className="tistory-editor__icon-btn" title="번호 목록" aria-label="번호 목록" onClick={() => { focusEditor(); execCmd('insertOrderedList') }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M4 5h2v2H4V5zm0 6h2v2H4v-2zm0 6h2v2H4v-2zM8 5h12v2H8V5zm0 6h12v2H8v-2zm0 6h12v2H8v-2z" /></svg>
            </button>

            <button type="button" className="tistory-editor__icon-btn" title="구분선" aria-label="구분선" onClick={insertHr}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M4 11h16v2H4v-2z" /></svg>
            </button>

            <div className="tistory-editor__popover-wrap">
              <button
                type="button"
                className="tistory-editor__icon-btn"
                title="더보기"
                aria-expanded={showMore}
                aria-label="더보기"
                onClick={() => {
                  setShowMore((v) => !v)
                  setShowEmoji(false)
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
              </button>
              {showMore ? (
                <div className="tistory-editor__popover tistory-editor__popover--menu">
                  <button
                    type="button"
                    className="tistory-editor__menu-item"
                    onClick={() => {
                      focusEditor()
                      execCmd('removeFormat')
                      setShowMore(false)
                    }}
                  >
                    서식 지우기
                  </button>
                  <button
                    type="button"
                    className="tistory-editor__menu-item"
                    onClick={() => {
                      focusEditor()
                      execCmd('undo')
                      setShowMore(false)
                    }}
                  >
                    실행 취소
                  </button>
                </div>
              ) : null}
            </div>

            <div className="tistory-editor__toolbar-spacer" />

            <select
              className="tistory-editor__toolbar-select"
              aria-label="편집 모드"
              value={editorMode}
              onChange={(e) => handleModeChange(e.target.value)}
            >
              {EDITOR_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <main className="tistory-editor__canvas">
        <div className="tistory-editor__sheet">
          <select
            className="tistory-editor__category"
            aria-label="카테고리"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value || 'empty'} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <input
            className="tistory-editor__title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            aria-label="제목"
          />

          <div className="tistory-editor__title-rule" aria-hidden />

          {editorMode === 'visual' ? (
            <div
              ref={editorRef}
              className={`tistory-editor__body${bodyEmpty ? ' tistory-editor__body--empty' : ''}`}
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-multiline="true"
              aria-label="본문"
              data-placeholder="내용을 입력하세요. 사진·표·링크는 위 도구를 사용하세요."
              onInput={syncHtmlFromEditor}
            />
          ) : (
            <textarea
              className="tistory-editor__html"
              value={htmlSource}
              onChange={(e) => setHtmlSource(e.target.value)}
              spellCheck={false}
              aria-label="HTML 소스"
            />
          )}
        </div>
      </main>

      <footer className="tistory-editor__footer">
        <p className="tistory-editor__footer-note">교안 에디터 · 로컬 초안</p>
        <div className="tistory-editor__footer-actions">
          <button type="button" className="tistory-editor__btn-draft" onClick={handleTempSave}>
            임시저장
            {draftCount > 0 ? <span className="tistory-editor__draft-badge">{draftCount}</span> : null}
          </button>
          <button type="button" className="tistory-editor__btn-done" onClick={handleComplete}>
            완료
          </button>
        </div>
      </footer>

      {toast ? (
        <div className="tistory-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  )
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams, useMatch } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import {
  getMaterialDetail,
  getMaterialViewer,
  parseAspectRatioString,
  parseMaterialResponse,
  postMaterialProgress,
} from '../../../api/materials.js'
import { ROUTES } from '../../../shared/constants/routes.js'
import { resolvePdfFileForViewer } from './materialPdfAuth.js'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import './MaterialPdfViewerPage.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

/**
 * 교안 PDF 전용 뷰어 (학생·교수 공통 라우트).
 * - 학생: `ROUTES.studentMaterialViewer`
 * - 교수: `ROUTES.professorMaterialViewer`
 */
export default function MaterialPdfViewerPage() {
  const { materialId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isProfessorRoute = Boolean(useMatch(ROUTES.professorMaterialViewer))

  const mid = materialId ?? ''

  const exitTo = isProfessorRoute ? ROUTES.professorMaterials : ROUTES.studentMaterials
  const logoHref = isProfessorRoute ? ROUTES.professorDashboard : ROUTES.studentDashboard

  const [userEmail] = useState('user@school.edu')

  const [title, setTitle] = useState('')
  const [metaLoading, setMetaLoading] = useState(true)
  const [metaError, setMetaError] = useState(null)
  const [allowDownload, setAllowDownload] = useState(true)
  const [apiPageCount, setApiPageCount] = useState(null)
  const [aspectRatioCss, setAspectRatioCss] = useState('16 / 9')

  const [pdfFile, setPdfFile] = useState(null)
  const [pdfLoadError, setPdfLoadError] = useState(null)
  const revokeRef = useRef(null)

  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [jumpInput, setJumpInput] = useState('1')
  const [jumpError, setJumpError] = useState(null)

  const scrollRef = useRef(null)
  const [frameWidth, setFrameWidth] = useState(640)

  const pageQuery = searchParams.get('page')

  const initialPageFromQuery = useMemo(() => {
    const raw = pageQuery
    const n = raw ? Number.parseInt(raw, 10) : NaN
    return Number.isFinite(n) && n >= 1 ? n : 1
  }, [pageQuery])

  useEffect(() => {
    setPageNumber(initialPageFromQuery)
  }, [initialPageFromQuery, mid])

  useEffect(() => {
    setJumpInput(String(pageNumber))
  }, [pageNumber])

  useEffect(() => {
    if (metaLoading || metaError) return
    if (pageQuery === String(pageNumber)) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('page', String(pageNumber))
        return next
      },
      { replace: true },
    )
  }, [pageNumber, metaLoading, metaError, pageQuery, setSearchParams])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width
      if (w && Number.isFinite(w)) setFrameWidth(Math.floor(w))
    })
    ro.observe(el)
    setFrameWidth(Math.floor(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [pdfFile, metaLoading, metaError])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = 0
  }, [pageNumber])

  useEffect(() => {
    let cancelled = false
    revokeRef.current?.()
    revokeRef.current = null

    if (!mid) {
      setMetaLoading(false)
      setMetaError('교안 ID가 없습니다.')
      return
    }

    setMetaLoading(true)
    setMetaError(null)
    setPdfFile(null)
    setPdfLoadError(null)
    setNumPages(0)
    setApiPageCount(null)
    setAspectRatioCss('16 / 9')
    setTitle('')

    ;(async () => {
      try {
        const viewerRes = await getMaterialViewer(mid)
        if (cancelled) return

        const viewer = parseMaterialResponse(viewerRes)

        let detail = null
        try {
          const detailRes = await getMaterialDetail(mid)
          if (!cancelled) detail = parseMaterialResponse(detailRes)
        } catch {
          detail = null
        }
        if (cancelled) return

        if (detail?.title) setTitle(String(detail.title))
        else if (viewer?.title) setTitle(String(viewer.title))
        else setTitle(`교안 · ${mid}`)

        const pageHint = Number(viewer?.pageCount) || Number(detail?.pageCount)
        if (Number.isFinite(pageHint) && pageHint > 0) setApiPageCount(pageHint)

        const ar =
          parseAspectRatioString(viewer?.aspectRatio) ||
          parseAspectRatioString(detail?.aspectRatio)
        if (ar) setAspectRatioCss(ar)

        const pdfUrl = viewer?.pdfUrl
        if (!pdfUrl) {
          setMetaError('PDF 주소를 불러오지 못했습니다.')
          setMetaLoading(false)
          return
        }

        setAllowDownload(viewer?.allowDownload !== false)

        const { file, revoke } = await resolvePdfFileForViewer(String(pdfUrl))
        if (cancelled) {
          revoke?.()
          return
        }
        revokeRef.current = revoke ?? null
        setPdfFile(file)
      } catch (e) {
        if (!cancelled) {
          const msg =
            e?.response?.data?.message ||
            e?.message ||
            '교안 정보를 불러오지 못했습니다.'
          setMetaError(typeof msg === 'string' ? msg : '교안 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setMetaLoading(false)
      }
    })()

    return () => {
      cancelled = true
      revokeRef.current?.()
      revokeRef.current = null
    }
  }, [mid])

  useEffect(() => {
    if (!mid || !pageNumber || metaLoading || !pdfFile) return
    const t = window.setTimeout(() => {
      postMaterialProgress(mid, pageNumber).catch(() => {})
    }, 700)
    return () => window.clearTimeout(t)
  }, [mid, pageNumber, metaLoading, pdfFile])

  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n)
    setPageNumber((p) => Math.min(Math.max(1, p), n))
    setPdfLoadError(null)
  }, [])

  const onDocumentLoadError = useCallback((err) => {
    const msg = err?.message || 'PDF를 불러오지 못했습니다.'
    setPdfLoadError(msg)
  }, [])

  const applyJump = useCallback(() => {
    if (metaLoading || metaError || pdfLoadError || !pdfFile) return
    const raw = String(jumpInput).trim()
    const digits = raw.replace(/\D/g, '')
    if (digits.length === 0) {
      setJumpError('페이지 번호(숫자)를 입력해 주세요.')
      return
    }
    const n = Number.parseInt(digits, 10)
    const max = (numPages > 0 ? numPages : apiPageCount) || 1
    if (!Number.isFinite(n)) {
      setJumpError('페이지 번호(숫자)를 입력해 주세요.')
      return
    }
    if (n < 1 || n > max) {
      setJumpError(`1~${max}페이지만 이동할 수 있습니다.`)
      return
    }
    setJumpError(null)
    setPageNumber(n)
  }, [jumpInput, numPages, apiPageCount, metaLoading, metaError, pdfLoadError, pdfFile])

  const handleJumpKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        applyJump()
      }
    },
    [applyJump],
  )

  const bottomPageDen =
    numPages > 0 ? numPages : Number.isFinite(apiPageCount) && apiPageCount > 0 ? apiPageCount : 0

  const bottomPageDisplay = useMemo(() => {
    if (metaError || pdfLoadError) return { cur: 0, total: 0 }
    if (metaLoading || bottomPageDen === 0) return { cur: 0, total: 0 }
    return { cur: pageNumber, total: bottomPageDen }
  }, [metaError, pdfLoadError, metaLoading, bottomPageDen, pageNumber])

  const jumpDisabled =
    metaLoading || Boolean(metaError) || Boolean(pdfLoadError) || !pdfFile

  const handleExit = useCallback(() => {
    navigate(exitTo)
  }, [navigate, exitTo])

  const handleLogout = useCallback(() => {
    navigate(logoHref)
  }, [navigate, logoHref])

  const headerProps = useMemo(
    () => ({
      userEmail,
      onLogout: handleLogout,
      logoHref,
      logoLabel: 'EDU HUB',
    }),
    [userEmail, handleLogout, logoHref],
  )

  const subbarTitle = metaLoading
    ? '교안을 불러오는 중…'
    : title.trim().length > 0
      ? title
      : mid
        ? `교안 · ${mid}`
        : '교안 뷰어'

  return (
    <AppLayout
      className="edu-app-layout--material-pdf-fullbleed"
      headerProps={headerProps}
      contentClassName="edu-mat-pdf-viewer-layout-content"
    >
      <div className="edu-mat-pdf-viewer">
        <div className="edu-mat-pdf-viewer__subbar">
          <h1 className="edu-mat-pdf-viewer__doc-title">{subbarTitle}</h1>
          <div className="edu-mat-pdf-viewer__subbar-spacer" aria-hidden />
          <button type="button" className="edu-mat-pdf-viewer__exit-btn" onClick={handleExit}>
            뷰어 종료
          </button>
        </div>

        <main className="edu-mat-pdf-viewer__main">
          <div className="edu-mat-pdf-viewer__jump-above-grey">
            <div className="edu-mat-pdf-viewer__jump-row">
              <label className="edu-mat-pdf-viewer__page-jump-label" htmlFor="edu-mat-pdf-page-jump">
                페이지 이동
              </label>
              <input
                id="edu-mat-pdf-page-jump"
                className="edu-mat-pdf-viewer__page-jump-input"
                type="search"
                inputMode="numeric"
                autoComplete="off"
                placeholder="페이지"
                aria-label="이동할 페이지 번호"
                disabled={jumpDisabled}
                value={jumpInput}
                onChange={(e) => {
                  setJumpInput(e.target.value)
                  setJumpError(null)
                }}
                onKeyDown={handleJumpKeyDown}
                aria-invalid={Boolean(jumpError)}
                aria-describedby="edu-mat-pdf-page-jump-hint edu-mat-pdf-page-jump-err"
              />
              <button
                type="button"
                className="edu-mat-pdf-viewer__small-btn"
                disabled={jumpDisabled}
                onClick={applyJump}
              >
                이동
              </button>
              <span id="edu-mat-pdf-page-jump-hint" className="edu-mat-pdf-viewer__sr-only">
                Enter 키 또는 이동 버튼으로 해당 페이지로 이동합니다.
              </span>
              {jumpError ? (
                <span id="edu-mat-pdf-page-jump-err" className="edu-mat-pdf-viewer__jump-error" role="status">
                  {jumpError}
                </span>
              ) : (
                <span id="edu-mat-pdf-page-jump-err" className="edu-mat-pdf-viewer__sr-only" />
              )}
            </div>
          </div>

          <div className="edu-mat-pdf-viewer__grey-frame">
            <div className="edu-mat-pdf-viewer__grey-frame-content">
              {metaLoading ? (
              <div className="edu-mat-pdf-viewer__frame-fill">
                <p className="edu-mat-pdf-viewer__frame-status">교안을 불러오는 중…</p>
              </div>
            ) : metaError ? (
              <div className="edu-mat-pdf-viewer__frame-fill">
                <p className="edu-mat-pdf-viewer__frame-status edu-mat-pdf-viewer__frame-status--error" role="alert">
                  {metaError}
                </p>
              </div>
            ) : (
              <div className="edu-mat-pdf-viewer__stage">
                <div className="edu-mat-pdf-viewer__aspect" style={{ aspectRatio: aspectRatioCss }}>
                  <div ref={scrollRef} className="edu-mat-pdf-viewer__scroll">
                    {pdfLoadError ? (
                      <div className="edu-mat-pdf-viewer__frame-fill edu-mat-pdf-viewer__frame-fill--tight">
                        <p className="edu-mat-pdf-viewer__frame-status edu-mat-pdf-viewer__frame-status--error" role="alert">
                          {pdfLoadError}
                        </p>
                      </div>
                    ) : (
                      <div className="edu-mat-pdf-viewer__page-wrap">
                        <Document
                          className="edu-mat-pdf-viewer__document"
                          file={pdfFile}
                          onLoadSuccess={onDocumentLoadSuccess}
                          onLoadError={onDocumentLoadError}
                          loading={
                            <div className="edu-mat-pdf-viewer__frame-fill edu-mat-pdf-viewer__frame-fill--tight">
                              <p className="edu-mat-pdf-viewer__frame-status">PDF 렌더링 준비 중…</p>
                            </div>
                          }
                        >
                          <div className="edu-mat-pdf-viewer__slide">
                            <Page
                              pageNumber={pageNumber}
                              width={Math.max(280, frameWidth)}
                              renderTextLayer
                              renderAnnotationLayer
                            />
                          </div>
                        </Document>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>

          <div
            className="edu-mat-pdf-viewer__bottom-nav"
            role="status"
            aria-live="polite"
            aria-label="현재 페이지"
          >
            <span className="edu-mat-pdf-viewer__page-indicator">
              {bottomPageDisplay.cur} / {bottomPageDisplay.total}
            </span>
          </div>

          {!metaLoading && !metaError && !allowDownload ? (
            <p className="edu-mat-pdf-viewer__hint">이 교안은 다운로드가 제한되어 있습니다.</p>
          ) : null}
        </main>
      </div>
    </AppLayout>
  )
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams, useMatch } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { parseAspectRatioString, readPdfUrlFromLesson } from '../../../shared/utils/pdfMeta.js'
import { fetchLessonDetail } from '../../catalog/lessonCatalogService.js'
import {
  PROFESSOR_MATERIALS_COURSE_QUERY_KEY,
  ROUTES,
  professorMaterialsPath,
  studentMaterialsPath,
  STUDENT_MATERIALS_COURSE_QUERY_KEY,
} from '../../../shared/constants/routes.js'
import { resolvePdfFileForViewer } from './materialPdfAuth.js'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import { createHeaderLogoutHandler } from '../../../app/headerLogoutHandler.js'
import './MaterialPdfViewerPage.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

/**
 * 교안 PDF 뷰어 — GET /api/lessons/{id} 응답의 PDF URL 필드 사용 (명세 §11 확장).
 * 라우트 `:materialId` 슬롯 = lessonId.
 */
export default function MaterialPdfViewerPage() {
  const { materialId: lessonIdParam } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isProfessorRoute = Boolean(useMatch(ROUTES.professorMaterialViewer))

  const mid = lessonIdParam ?? ''

  const courseQueryKey = isProfessorRoute
    ? PROFESSOR_MATERIALS_COURSE_QUERY_KEY
    : STUDENT_MATERIALS_COURSE_QUERY_KEY
  const courseIdFromQuery = searchParams.get(courseQueryKey) ?? ''
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
    ;(async () => {
      try {
        const lesson = await fetchLessonDetail(mid)
        if (cancelled) return

        if (!lesson) {
          setMetaError('교안을 찾을 수 없습니다.')
          setMetaLoading(false)
          return
        }

        if (lesson.title) setTitle(String(lesson.title))
        else setTitle(`교안 · ${mid}`)

        const pageHint = Number(lesson.pageCount ?? lesson.page_count)
        if (Number.isFinite(pageHint) && pageHint > 0) setApiPageCount(pageHint)

        const ar = parseAspectRatioString(lesson.aspectRatio ?? lesson.aspect_ratio)
        if (ar) setAspectRatioCss(ar)

        const pdfUrl = readPdfUrlFromLesson(lesson)
        if (!pdfUrl) {
          setMetaError(
            'PDF URL이 없습니다. GET /api/lessons/{id} 응답에 pdfUrl(또는 동등 필드)이 필요합니다.',
          )
          setMetaLoading(false)
          return
        }

        setAllowDownload(lesson.allowDownload !== false)

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
    const fromQuery = courseIdFromQuery.trim()
    const courseId = fromQuery || ''
    if (isProfessorRoute) {
      navigate(professorMaterialsPath(courseId || undefined))
      return
    }
    navigate(studentMaterialsPath(courseId || undefined))
  }, [navigate, isProfessorRoute, courseIdFromQuery, mid])

  const onLogout = useCallback(() => createHeaderLogoutHandler(navigate)(), [navigate])

  const headerProps = useMemo(
    () => ({
      userEmail,
      onLogout,
      logoHref,
      logoLabel: 'EDU HUB',
      logoImageOnly: true,
    }),
    [userEmail, onLogout, logoHref],
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
        <div className="edu-mat-pdf-viewer__body">
          <aside className="edu-mat-pdf-viewer__sidebar" aria-label="교안 뷰어 도구">
            <h1 className="edu-mat-pdf-viewer__doc-title">{subbarTitle}</h1>

            <div className="edu-mat-pdf-viewer__sidebar-tools">
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

            {!metaLoading && !metaError && !allowDownload ? (
              <p className="edu-mat-pdf-viewer__hint">이 교안은 다운로드가 제한되어 있습니다.</p>
            ) : null}

            <button type="button" className="edu-mat-pdf-viewer__exit-btn" onClick={handleExit}>
              뷰어 종료
            </button>
          </aside>

          <main className="edu-mat-pdf-viewer__main">
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
          </div>
          </main>
        </div>
      </div>
    </AppLayout>
  )
}

/** API `aspectRatio` 문자열(`16:9`)을 CSS `aspect-ratio` 값으로 변환 */
export function parseAspectRatioString(raw) {
  if (raw == null || typeof raw !== 'string') return null
  const m = String(raw).trim().match(/^(\d+)\s*:\s*(\d+)$/)
  return m ? `${m[1]} / ${m[2]}` : null
}

/**
 * lesson 상세 응답에서 PDF URL 후보 필드 추출 (명세 §11 확장 필드 대응)
 * @param {object|null|undefined} lesson
 */
export function readPdfUrlFromLesson(lesson) {
  if (!lesson || typeof lesson !== 'object') return null
  const candidates = [lesson.pdfUrl, lesson.pdf_url, lesson.fileUrl, lesson.file_url]
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim()
  }
  return null
}

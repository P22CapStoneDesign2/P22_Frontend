import './PdfViewerSection.css'

/**
 * 교안 PDF 영역. 현재는 placeholder이며, 이후 pdfUrl 등으로 확장할 수 있습니다.
 *
 * @param {object} props
 * @param {string} [props.placeholderText]
 * @param {string} [props.pdfUrl]
 * @param {string} [props.className]
 */
export default function PdfViewerSection({
  placeholderText = '교안 PDF 파일',
  pdfUrl,
  className = '',
}) {
  return (
    <section className={`edu-pdf-section ${className}`.trim()} aria-label="교안 PDF">
      {pdfUrl ? (
        <iframe title="교안 PDF" className="edu-pdf-section__frame" src={pdfUrl} />
      ) : (
        <div className="edu-pdf-section__placeholder">{placeholderText}</div>
      )}
    </section>
  )
}

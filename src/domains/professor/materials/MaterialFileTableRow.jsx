import { Link } from 'react-router-dom'
import { professorMaterialViewerPath } from '../../../shared/constants/routes.js'

/**
 * @param {object} props
 * @param {number} props.rowNumber
 * @param {{ id: string, fileName: string, createdAt: string, updatedAt: string }} props.file
 * @param {string} [props.courseId]
 * @param {(fileId: string) => void} props.onReplaceFile
 * @param {(fileId: string) => void} props.onDeleteFile
 * @param {(fileId: string) => void} [props.onOpenViewer]
 */
export default function MaterialFileTableRow({
  rowNumber,
  file,
  courseId = '',
  onReplaceFile,
  onDeleteFile,
  onOpenViewer,
}) {
  const viewerPath = professorMaterialViewerPath(file.id, courseId)

  const handleLinkClick = (e) => {
    if (typeof onOpenViewer !== 'function') return
    e.preventDefault()
    onOpenViewer(file.id)
  }

  return (
    <tr className="edu-mat-table__row">
      <td className="edu-mat-table__td edu-mat-table__td--num">{rowNumber}</td>
      <td className="edu-mat-table__td edu-mat-table__td--name">
        {typeof onOpenViewer === 'function' ? (
          <a
            href={viewerPath}
            className="edu-mat-table__link"
            title={file.fileName}
            onClick={handleLinkClick}
          >
            {file.fileName}
          </a>
        ) : (
          <Link className="edu-mat-table__link" to={viewerPath} title={file.fileName}>
            {file.fileName}
          </Link>
        )}
      </td>
      <td className="edu-mat-table__td edu-mat-table__td--date">{file.createdAt}</td>
      <td className="edu-mat-table__td edu-mat-table__td--date">{file.updatedAt}</td>
      <td className="edu-mat-table__td edu-mat-table__td--actions">
        <div className="edu-mat-table__actions edu-action-group">
          <button
            type="button"
            className="edu-mat-row-btn edu-mat-row-btn--edit"
            onClick={() => onReplaceFile(file.id)}
          >
            수정
          </button>
          <button
            type="button"
            className="edu-mat-row-btn edu-mat-row-btn--delete"
            onClick={() => onDeleteFile(file.id)}
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  )
}

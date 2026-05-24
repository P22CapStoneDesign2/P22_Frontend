import { Link } from 'react-router-dom'
import { studentMaterialViewerPath } from '../../../shared/constants/routes.js'

/**
 * @param {{ rowNumber: number, materialId: string, fileName: string, uploadDateDisplay: string }} props.row
 * @param {string} [props.courseId]
 */
export default function StudentMaterialsTableRow({ row, courseId = '' }) {
  const courseIdForViewer = (courseId || row.materialId || '').trim()

  return (
    <tr className="edu-stu-mat-table__row">
      <td className="edu-stu-mat-table__td edu-stu-mat-table__td--num">{row.rowNumber}</td>
      <td className="edu-stu-mat-table__td edu-stu-mat-table__td--name">
        <Link
          className="edu-stu-mat-table__link"
          to={studentMaterialViewerPath(row.materialId, courseIdForViewer)}
        >
          {row.fileName}
        </Link>
      </td>
      <td className="edu-stu-mat-table__td edu-stu-mat-table__td--date">{row.uploadDateDisplay}</td>
    </tr>
  )
}

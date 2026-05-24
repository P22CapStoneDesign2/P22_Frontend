import StudentMaterialsTableRow from './StudentMaterialsTableRow.jsx'

/**
 * @param {object} props
 * @param {Array<{ materialId: string, fileName: string, uploadDateDisplay: string, rowNumber: number }>} props.rows
 * @param {'idle' | 'empty' | 'rows'} props.tableState
 * @param {string} [props.courseId]
 */
export default function StudentMaterialsTable({ rows, tableState, courseId = '' }) {
  const isEmpty = tableState === 'empty'

  return (
    <div className="edu-stu-mat-table-wrap">
      <table className="edu-stu-mat-table">
        <caption className="edu-stu-mat-table__caption">교안 목록</caption>
        <colgroup>
          <col className="edu-stu-mat-table__col edu-stu-mat-table__col--num" />
          <col className="edu-stu-mat-table__col edu-stu-mat-table__col--name" />
          <col className="edu-stu-mat-table__col edu-stu-mat-table__col--date" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="edu-stu-mat-table__th edu-stu-mat-table__th--num">
              번호
            </th>
            <th scope="col" className="edu-stu-mat-table__th edu-stu-mat-table__th--name">
              교안
            </th>
            <th scope="col" className="edu-stu-mat-table__th edu-stu-mat-table__th--date">
              업로드 날짜
            </th>
          </tr>
        </thead>
        <tbody>
          {tableState === 'idle' ? (
            <tr>
              <td colSpan={3} className="edu-stu-mat-table__empty">
                교안 목록을 불러오는 중입니다.
              </td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td colSpan={3} className="edu-stu-mat-table__empty">
                등록된 교안이 없습니다.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <StudentMaterialsTableRow key={row.materialId} row={row} courseId={courseId} />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

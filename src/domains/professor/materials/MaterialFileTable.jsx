import MaterialFileTableRow from './MaterialFileTableRow.jsx'

/**
 * @param {object} props
 * @param {Array<{ id: string, fileName: string, createdAt: string, updatedAt: string }>} props.files
 * @param {(fileId: string) => void} props.onReplaceFile
 * @param {(fileId: string) => void} props.onDeleteFile
 */
export default function MaterialFileTable({ files, onReplaceFile, onDeleteFile }) {
  const isEmpty = !files || files.length === 0

  return (
    <div className="edu-mat-table-wrap">
      <table className="edu-mat-table">
        <caption className="edu-mat-table__caption">교안 파일 목록</caption>
        <colgroup>
          <col className="edu-mat-table__col edu-mat-table__col--num" />
          <col className="edu-mat-table__col edu-mat-table__col--name" />
          <col className="edu-mat-table__col edu-mat-table__col--date" />
          <col className="edu-mat-table__col edu-mat-table__col--date" />
          <col className="edu-mat-table__col edu-mat-table__col--action" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="edu-mat-table__th edu-mat-table__th--num">
              번호
            </th>
            <th scope="col" className="edu-mat-table__th edu-mat-table__th--name">
              교안 파일명
            </th>
            <th scope="col" className="edu-mat-table__th edu-mat-table__th--date">
              등록한 날짜
            </th>
            <th scope="col" className="edu-mat-table__th edu-mat-table__th--date">
              수정한 날짜
            </th>
            <th scope="col" className="edu-mat-table__th edu-mat-table__th--action">
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={5} className="edu-mat-table__empty">
                등록된 교안 파일이 없습니다.
              </td>
            </tr>
          ) : (
            files.map((file, index) => (
              <MaterialFileTableRow
                key={file.id}
                rowNumber={index + 1}
                file={file}
                onReplaceFile={onReplaceFile}
                onDeleteFile={onDeleteFile}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

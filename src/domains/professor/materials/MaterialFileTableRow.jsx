/**
 * @param {object} props
 * @param {number} props.rowNumber
 * @param {{ id: string, fileName: string, createdAt: string, updatedAt: string }} props.file
 * @param {(fileId: string) => void} props.onReplaceFile
 * @param {(fileId: string) => void} props.onDeleteFile
 */
export default function MaterialFileTableRow({ rowNumber, file, onReplaceFile, onDeleteFile }) {
  return (
    <tr className="edu-mat-table__row">
      <td className="edu-mat-table__td edu-mat-table__td--num">{rowNumber}</td>
      <td className="edu-mat-table__td edu-mat-table__td--name">
        <span className="edu-mat-table__file-name" title={file.fileName}>
          {file.fileName}
        </span>
      </td>
      <td className="edu-mat-table__td edu-mat-table__td--date">{file.createdAt}</td>
      <td className="edu-mat-table__td edu-mat-table__td--date">{file.updatedAt}</td>
      <td className="edu-mat-table__td edu-mat-table__td--actions">
        <div className="edu-mat-table__actions">
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

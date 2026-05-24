import { useEffect, useState } from 'react'
import { fetchStudentLessonTableRows } from '../../catalog/lessonCatalogService.js'
import StudentMaterialsTable from './StudentMaterialsTable.jsx'

/**
 * 학생 교안 보기 — GET /api/lessons/my
 */
export default function StudentMaterialsContent() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchStudentLessonTableRows().then((list) => {
      if (cancelled) return
      setRows(
        list.map((r) => ({
          materialId: r.lessonId,
          fileName: r.title,
          uploadDateDisplay: r.dateLabel,
          rowNumber: r.rowNumber,
        })),
      )
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const tableState = loading ? 'idle' : rows.length === 0 ? 'empty' : 'rows'

  return (
    <div className="edu-stu-mat-list">
      <div className="edu-stu-mat-list__card">
        <h1 className="edu-stu-mat-list__title">교안 보기</h1>
        <p className="edu-stu-mat-list__intro">
          승인된 교안 목록입니다. 제목을 눌러 상세·PDF를 확인할 수 있습니다.
        </p>

        {loading ? (
          <p className="edu-stu-mat-list__course-status" role="status">
            교안 목록을 불러오는 중…
          </p>
        ) : null}

        <StudentMaterialsTable rows={rows} tableState={tableState} />
      </div>
    </div>
  )
}

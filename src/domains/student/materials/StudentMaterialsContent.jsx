import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageBackButton from '../../../components/ui/PageBackButton/PageBackButton.jsx'
import { ROUTES, STUDENT_MATERIALS_COURSE_QUERY_KEY } from '../../../shared/constants/routes.js'
import { fetchStudentLessonTableRows, fetchLessonMaterialsForLesson } from '../../catalog/lessonCatalogService.js'
import StudentMaterialsTable from './StudentMaterialsTable.jsx'

export default function StudentMaterialsContent() {
  const [searchParams] = useSearchParams()
  const courseIdFromUrl = searchParams.get(STUDENT_MATERIALS_COURSE_QUERY_KEY) ?? ''

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const lessonRows = await fetchStudentLessonTableRows()
      if (cancelled) return

      const materialLists = await Promise.all(
        lessonRows.map((r) => fetchLessonMaterialsForLesson(r.lessonId))
      )
      if (cancelled) return

      const allMaterials = materialLists.flat()
      setRows(
        allMaterials.map((m, i) => ({
          materialId: m.materialId,
          lessonId: m.lessonId,
          fileName: m.title,
          uploadDateDisplay: m.createdAt,
          rowNumber: i + 1,
        }))
      )
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const tableState = loading ? 'idle' : rows.length === 0 ? 'empty' : 'rows'

  return (
    <div className="edu-stu-mat-list">
      <div className="edu-stu-mat-list__card">
        <h1 className="edu-stu-mat-list__title">교안 보기</h1>
        <PageBackButton fallbackPath={ROUTES.studentDashboard} />
        <p className="edu-stu-mat-list__intro">
          승인된 교안 목록입니다. 제목을 눌러 상세·PDF를 확인할 수 있습니다.
        </p>

        {loading ? (
          <p className="edu-stu-mat-list__course-status" role="status">
            교안 목록을 불러오는 중…
          </p>
        ) : null}

        <StudentMaterialsTable rows={rows} tableState={tableState} courseId={courseIdFromUrl} />
      </div>
    </div>
  )
}
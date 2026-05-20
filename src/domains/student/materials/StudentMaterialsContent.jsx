import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SelectDropdown from '../../../components/ui/SelectDropdown/SelectDropdown.jsx'
import { STUDENT_MATERIALS_COURSE_QUERY_KEY } from '../../../shared/constants/routes.js'
import {
  courseOptionsFromDto,
  loadProfessorMaterialsDto,
  materialTableRowsForCourseFromDto,
} from '../../professor/materials/professorMaterialsStorage.js'
import StudentMaterialsTable from './StudentMaterialsTable.jsx'

/**
 * 학생 교안 보기 — 강의 선택 즉시 목록 표시, courseId query로 선택 유지
 */
export default function StudentMaterialsContent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const materialsDto = useMemo(() => loadProfessorMaterialsDto(), [])
  const courses = useMemo(() => courseOptionsFromDto(materialsDto), [materialsDto])

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)

  const courseIdFromUrl = searchParams.get(STUDENT_MATERIALS_COURSE_QUERY_KEY) ?? ''

  const selectedCourse = useMemo(() => {
    if (!courseIdFromUrl) return null
    return courses.find((c) => c.value === courseIdFromUrl) ?? null
  }, [courses, courseIdFromUrl])

  const tableRows = useMemo(() => {
    if (!selectedCourse?.value) return []
    return materialTableRowsForCourseFromDto(materialsDto, selectedCourse.value)
  }, [materialsDto, selectedCourse])

  const tableState = !selectedCourse ? 'idle' : tableRows.length === 0 ? 'empty' : 'rows'

  const handleCourseSelect = (option) => {
    const next = new URLSearchParams(searchParams)
    next.set(STUDENT_MATERIALS_COURSE_QUERY_KEY, option.value)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="edu-stu-mat-list">
      <div className="edu-stu-mat-list__card">
        <h1 className="edu-stu-mat-list__title">교안 보기</h1>
        <p className="edu-stu-mat-list__intro">강의를 선택한 뒤 등록된 교안을 확인하고 뷰어로 열 수 있습니다.</p>

        <div className="edu-stu-mat-list__toolbar">
          <div className="edu-stu-mat-list__field">
            <span className="edu-stu-mat-list__label" id="stu-mat-course-label">
              강의
            </span>
            <SelectDropdown
              className="edu-stu-mat-list__select"
              options={courses}
              selected={selectedCourse}
              placeholder="강의를 선택하세요"
              isOpen={courseDropdownOpen}
              onOpenChange={setCourseDropdownOpen}
              onSelect={handleCourseSelect}
              emptyMessage="등록된 강의가 없습니다."
            />
          </div>
        </div>

        {selectedCourse ? (
          <p className="edu-stu-mat-list__course-status" role="status">
            선택된 강의: <strong>{selectedCourse.label}</strong>
          </p>
        ) : null}

        <StudentMaterialsTable
          rows={tableRows}
          tableState={tableState}
          courseId={selectedCourse?.value ?? ''}
        />
      </div>
    </div>
  )
}

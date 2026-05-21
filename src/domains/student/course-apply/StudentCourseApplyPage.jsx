import { useMemo, useState } from 'react'
import Button from '../../../components/ui/Button/Button.jsx'
import './StudentCourseApplyPage.css'

/** @typedef {{ id: string, name: string, professorName: string }} CourseRow */

/** mock — API 연동 전 목업 데이터 (화면 목업과 동일) */
const MOCK_COURSES = [
  { id: 'course-1', name: '컴퓨터 구조와 알고리즘', professorName: '홍길동' },
  { id: 'course-2', name: '인공지능기초', professorName: '김철수' },
]

function matchesQuery(text, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return String(text ?? '')
    .toLowerCase()
    .includes(q)
}

/** @param {CourseRow[]} courses @param {string} query */
function filterCourses(courses, query) {
  const q = query.trim().toLowerCase()
  if (!q) return courses
  return courses.filter(
    (c) => matchesQuery(c.name, q) || matchesQuery(c.professorName, q),
  )
}

/** 학생 — 과목 신청 (UI, mock 데이터) */
export default function StudentCourseApplyPage() {
  const [selectedCourseId, setSelectedCourseId] = useState(MOCK_COURSES[0]?.id ?? null)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCourses = useMemo(
    () => filterCourses(MOCK_COURSES, searchQuery),
    [searchQuery],
  )

  const handleApply = () => {
    if (!selectedCourseId) {
      window.alert('신청할 과목을 선택해 주세요.')
      return
    }
    const course = MOCK_COURSES.find((c) => c.id === selectedCourseId)
    if (!course) {
      window.alert('선택한 과목을 찾을 수 없습니다.')
      return
    }
    window.alert(`「${course.name}」 수강 신청 API 연동 전입니다.`)
  }

  return (
    <div className="edu-student-course-apply">
      <h1 className="edu-student-course-apply__title">과목 신청</h1>

      <form
        className="edu-student-course-apply__search"
        onSubmit={(e) => {
          e.preventDefault()
          setSearchQuery(searchInput)
        }}
      >
        <input
          type="search"
          className="edu-student-course-apply__search-input"
          placeholder="과목명, 담당 교수 검색 가능"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="과목 검색"
        />
        <Button type="submit" variant="primary" className="edu-student-course-apply__search-btn">
          검색
        </Button>
      </form>

      <div className="edu-student-course-apply__table-wrap">
        <div className="edu-student-course-apply__table-area">
          <div className="edu-student-course-apply__table-head">
            <table className="edu-student-course-apply__table">
              <caption className="edu-student-course-apply__caption">신청 가능 과목</caption>
              <colgroup>
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">과목명</th>
                  <th scope="col">담당 교수</th>
                </tr>
              </thead>
            </table>
          </div>
          <div
            className={`edu-student-course-apply__table-body${filteredCourses.length === 0 ? ' edu-student-course-apply__table-body--empty' : ''}`}
          >
            {filteredCourses.length === 0 ? (
              <p className="edu-student-course-apply__empty-msg">검색 결과가 없습니다.</p>
            ) : (
              <table className="edu-student-course-apply__table">
                <colgroup>
                  <col />
                  <col />
                </colgroup>
                <tbody>
                  {filteredCourses.map((course) => {
                    const isSelected = course.id === selectedCourseId
                    return (
                      <tr
                        key={course.id}
                        className={`edu-student-course-apply__course-tr${isSelected ? ' edu-student-course-apply__course-tr--selected' : ''}`}
                      >
                        <td>
                          <button
                            type="button"
                            className="edu-student-course-apply__course-select"
                            onClick={() => setSelectedCourseId(course.id)}
                          >
                            {course.name}
                          </button>
                        </td>
                        <td>{course.professorName}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="edu-student-course-apply__actions">
        <Button
          type="button"
          variant="secondary"
          className="edu-student-course-apply__apply-btn"
          onClick={handleApply}
        >
          신청
        </Button>
      </div>
    </div>
  )
}

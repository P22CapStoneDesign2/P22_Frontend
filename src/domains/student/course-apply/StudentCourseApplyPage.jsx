import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  cancelLessonEnrollment,
  enrollInLesson,
  getLessons,
  getMyLessons,
  lessonPageContent,
} from '../../../api/lessons.js'
import Button from '../../../components/ui/Button/Button.jsx'
import './StudentCourseApplyPage.css'

/** @typedef {'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'} EnrollmentStatus */

/** @typedef {{ id: string, name: string, professorName: string, description: string, enrollmentStatus: EnrollmentStatus }} CourseRow */

const ENROLLMENT_STATUS_LABEL = {
  NONE: '신청 가능',
  PENDING: '승인 대기',
  APPROVED: '승인 완료',
  REJECTED: '거절됨',
}

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
    (c) =>
      matchesQuery(c.name, q) ||
      matchesQuery(c.professorName, q) ||
      matchesQuery(c.description, q),
  )
}

/** @param {unknown} raw */
function normalizeEnrollmentStatus(raw) {
  const v = String(raw ?? '').toUpperCase()
  if (v === 'PENDING' || v === 'APPROVED' || v === 'REJECTED') return /** @type {EnrollmentStatus} */ (v)
  return 'NONE'
}

/**
 * @param {unknown} item
 * @param {Set<string>} approvedLessonIds
 */
function mapLessonToRow(item, approvedLessonIds) {
  if (!item || typeof item !== 'object') return null
  const id = item.id
  if (id === undefined || id === null) return null
  const idStr = String(id)

  let enrollmentStatus = 'NONE'
  if (approvedLessonIds.has(idStr)) {
    enrollmentStatus = 'APPROVED'
  } else {
    const fromItem =
      item.enrollmentStatus ??
      item.myEnrollmentStatus ??
      (item.enrollment && typeof item.enrollment === 'object'
        ? item.enrollment.status
        : undefined)
    enrollmentStatus = normalizeEnrollmentStatus(fromItem)
  }

  return {
    id: idStr,
    name: String(item.title ?? item.name ?? '—'),
    professorName: String(item.createdByName ?? item.professorName ?? '—'),
    description: String(item.description ?? ''),
    enrollmentStatus,
  }
}

/** @param {import('axios').AxiosResponse} res */
function enrollmentFromEnrollResponse(res) {
  const data = res?.data?.data
  if (data && typeof data === 'object' && data.status) {
    return normalizeEnrollmentStatus(data.status)
  }
  return 'PENDING'
}

export default function StudentCourseApplyPage() {
  const [courses, setCourses] = useState(/** @type {CourseRow[]} */ ([]))
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState(/** @type {string | null} */ (null))
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadLessons = useCallback(async () => {
    setListLoading(true)
    setListError('')
    try {
      const lessonsRes = await getLessons({ page: 0, size: 200, sort: 'createdAt,DESC' })

      const approvedIds = new Set()
      try {
        const myLessonsRes = await getMyLessons({ page: 0, size: 200 })
        for (const item of lessonPageContent(myLessonsRes)) {
          if (item && typeof item === 'object' && item.id != null) {
            approvedIds.add(String(item.id))
          }
        }
      } catch {
        /* 승인 목록(§29) 실패 시에도 전체 교안 목록(§10)은 표시 */
      }

      const rows = lessonPageContent(lessonsRes)
        .map((item) => mapLessonToRow(item, approvedIds))
        .filter(Boolean)

      setCourses(rows)
      setSelectedCourseId((prev) => {
        if (prev && rows.some((c) => c.id === prev)) return prev
        return rows[0]?.id ?? null
      })
    } catch (error) {
      setCourses([])
      setSelectedCourseId(null)
      setListError(error.response?.data?.message || '교안 목록을 불러오지 못했습니다.')
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLessons()
  }, [loadLessons])

  const filteredCourses = useMemo(
    () => filterCourses(courses, searchQuery),
    [courses, searchQuery],
  )

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  )

  const updateCourseStatus = useCallback((lessonId, status) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === lessonId ? { ...c, enrollmentStatus: status } : c)),
    )
  }, [])

  const handleEnroll = useCallback(async () => {
    const course = courses.find((c) => c.id === selectedCourseId)
    if (!course) {
      window.alert('신청할 교안을 선택해 주세요.')
      return
    }
    if (course.enrollmentStatus !== 'NONE') return
    if (actionLoading) return

    setActionLoading(true)
    try {
      const res = await enrollInLesson(course.id)
      const status = enrollmentFromEnrollResponse(res)
      updateCourseStatus(course.id, status)
      window.alert(
        res.data?.message ||
          `「${course.name}」 수강 신청이 접수되었습니다. 교수 승인 후 교안·퀴즈를 이용할 수 있습니다.`,
      )
    } catch (error) {
      const status = error.response?.status
      const message = error.response?.data?.message
      if (status === 409) {
        updateCourseStatus(course.id, 'PENDING')
      }
      window.alert(message || '수강 신청에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }, [courses, selectedCourseId, actionLoading, updateCourseStatus])

  const handleCancelEnrollment = useCallback(async () => {
    const course = courses.find((c) => c.id === selectedCourseId)
    if (!course) {
      window.alert('취소할 교안을 선택해 주세요.')
      return
    }
    if (course.enrollmentStatus !== 'PENDING') return
    if (actionLoading) return

    setActionLoading(true)
    try {
      const res = await cancelLessonEnrollment(course.id)
      updateCourseStatus(course.id, 'NONE')
      window.alert(res.data?.message || '수강 신청이 취소되었습니다.')
    } catch (error) {
      window.alert(error.response?.data?.message || '신청 취소에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }, [courses, selectedCourseId, actionLoading, updateCourseStatus])

  const primaryAction = useMemo(() => {
    if (!selectedCourse) {
      return { label: '신청', handler: handleEnroll, disabled: true }
    }
    switch (selectedCourse.enrollmentStatus) {
      case 'NONE':
        return {
          label: actionLoading ? '신청 중…' : '수강 신청',
          handler: handleEnroll,
          disabled: actionLoading,
        }
      case 'PENDING':
        return {
          label: actionLoading ? '취소 중…' : '신청 취소',
          handler: handleCancelEnrollment,
          disabled: actionLoading,
          variant: 'secondary',
        }
      case 'APPROVED':
        return { label: '승인 완료', handler: null, disabled: true }
      case 'REJECTED':
        return { label: '거절됨', handler: null, disabled: true }
      default:
        return { label: '신청', handler: handleEnroll, disabled: true }
    }
  }, [selectedCourse, actionLoading, handleEnroll, handleCancelEnrollment])

  const tableBodyMessage = useMemo(() => {
    if (listLoading) {
      return { text: '교안 목록을 불러오는 중…', isError: false }
    }
    if (listError) {
      return { text: listError, isError: true }
    }
    if (filteredCourses.length > 0) return null
    if (searchQuery.trim()) {
      return { text: '검색 결과가 없습니다.', isError: false }
    }
    if (courses.length === 0) {
      return { text: '등록된 교안이 없습니다.', isError: false }
    }
    return { text: '검색 결과가 없습니다.', isError: false }
  }, [listLoading, listError, filteredCourses.length, searchQuery, courses.length])

  const showTableEmpty = tableBodyMessage !== null

  return (
    <div className="edu-student-course-apply">
      <h1 className="edu-student-course-apply__title">교안 수강 신청</h1>
      <p className="edu-student-course-apply__lead">
        교안을 선택해 수강을 신청하면 교수 승인 후 교안·퀴즈를 이용할 수 있습니다.
      </p>

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
          placeholder="교안명, 담당 교수 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="교안 검색"
          disabled={listLoading}
        />
        <Button
          type="submit"
          variant="primary"
          className="edu-student-course-apply__search-btn"
          disabled={listLoading}
        >
          검색
        </Button>
      </form>

      <div className="edu-student-course-apply__table-wrap">
        <div className="edu-student-course-apply__table-area">
          <div className="edu-student-course-apply__table-head">
            <table className="edu-student-course-apply__table">
              <caption className="edu-student-course-apply__caption">신청 가능 교안</caption>
              <colgroup>
                <col />
                <col />
                <col className="edu-student-course-apply__col-status" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">교안명</th>
                  <th scope="col">담당 교수</th>
                  <th scope="col">신청 상태</th>
                </tr>
              </thead>
            </table>
          </div>
          <div
            className={`edu-student-course-apply__table-body${showTableEmpty ? ' edu-student-course-apply__table-body--empty' : ''}`}
          >
            {showTableEmpty && tableBodyMessage ? (
              <p
                className={`edu-student-course-apply__empty-msg${tableBodyMessage.isError ? ' edu-student-course-apply__empty-msg--error' : ''}`}
                role={tableBodyMessage.isError ? 'alert' : 'status'}
              >
                {tableBodyMessage.text}
              </p>
            ) : (
              <table className="edu-student-course-apply__table">
                <colgroup>
                  <col />
                  <col />
                  <col className="edu-student-course-apply__col-status" />
                </colgroup>
                <tbody>
                  {filteredCourses.map((course) => {
                    const isSelected = course.id === selectedCourseId
                    const status = course.enrollmentStatus
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
                        <td>
                          <span
                            className={`edu-student-course-apply__badge edu-student-course-apply__badge--${status.toLowerCase()}`}
                          >
                            {ENROLLMENT_STATUS_LABEL[status]}
                          </span>
                        </td>
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
          variant={primaryAction.variant === 'secondary' ? 'secondary' : 'primary'}
          className="edu-student-course-apply__apply-btn"
          onClick={() => {
            if (primaryAction.handler) void primaryAction.handler()
          }}
          disabled={
            listLoading || Boolean(listError) || primaryAction.disabled || !selectedCourseId
          }
        >
          {primaryAction.label}
        </Button>
      </div>
    </div>
  )
}

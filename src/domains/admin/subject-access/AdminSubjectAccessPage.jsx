import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  approveLessonEnrollment,
  getLessonEnrollments,
  getLessonsForAdmin,
  lessonPageContent,
  rejectLessonEnrollment,
} from '../../../api/lessons.js'
import Button from '../../../components/ui/Button/Button.jsx'
import {
  enrollmentRowKey,
  filterEnrollmentRows,
  filterLessons,
  mapEnrollmentToRow,
  mapLessonToSummary,
  tableEmptyMessage,
} from './adminSubjectAccessUtils.js'
import './AdminSubjectAccessPage.css'

/**
 * 관리자 — 교안 수강 신청 관리 (§14·§30~§32)
 */
export default function AdminSubjectAccessPage() {
  const [lessons, setLessons] = useState(/** @type {import('./adminSubjectAccessUtils.js').LessonSummary[]} */ ([]))
  const [lessonsLoading, setLessonsLoading] = useState(true)
  const [lessonsError, setLessonsError] = useState('')
  /** @type {string | null} null이면 전체 교안 */
  const [selectedLessonId, setSelectedLessonId] = useState(null)

  const [enrolled, setEnrolled] = useState(/** @type {import('./adminSubjectAccessUtils.js').EnrollmentRow[]} */ ([]))
  const [applicants, setApplicants] = useState(/** @type {import('./adminSubjectAccessUtils.js').EnrollmentRow[]} */ ([]))
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true)
  const [enrollmentsError, setEnrollmentsError] = useState('')

  const [lessonSearchInput, setLessonSearchInput] = useState('')
  const [lessonSearchQuery, setLessonSearchQuery] = useState('')
  const [enrolledSearchInput, setEnrolledSearchInput] = useState('')
  const [enrolledSearchQuery, setEnrolledSearchQuery] = useState('')
  const [applicantSearchInput, setApplicantSearchInput] = useState('')
  const [applicantSearchQuery, setApplicantSearchQuery] = useState('')

  const [selectedApplicantKeys, setSelectedApplicantKeys] = useState(() => new Set())
  const [actionLoading, setActionLoading] = useState(false)

  const loadAllEnrollments = useCallback(async (lessonRows) => {
    if (lessonRows.length === 0) {
      setEnrolled([])
      setApplicants([])
      return
    }

    setEnrollmentsLoading(true)
    setEnrollmentsError('')
    try {
      const perLesson = await Promise.allSettled(
        lessonRows.map(async (lesson) => {
          const [approvedRes, pendingRes] = await Promise.all([
            getLessonEnrollments(lesson.id, { status: 'APPROVED', page: 0, size: 200 }),
            getLessonEnrollments(lesson.id, { status: 'PENDING', page: 0, size: 200 }),
          ])
          return { lesson, approvedRes, pendingRes }
        }),
      )

      const enrolledRows = []
      const applicantRows = []
      let failedLessons = 0

      for (const result of perLesson) {
        if (result.status !== 'fulfilled') {
          failedLessons += 1
          continue
        }
        const { lesson, approvedRes, pendingRes } = result.value
        enrolledRows.push(
          ...lessonPageContent(approvedRes)
            .map((item) => mapEnrollmentToRow(item, lesson.id, lesson.name))
            .filter(Boolean),
        )
        applicantRows.push(
          ...lessonPageContent(pendingRes)
            .map((item) => mapEnrollmentToRow(item, lesson.id, lesson.name))
            .filter(Boolean),
        )
      }

      setEnrolled(enrolledRows)
      setApplicants(applicantRows)
      setSelectedApplicantKeys(new Set())

      if (failedLessons === lessonRows.length) {
        const reason = /** @type {PromiseRejectedResult} */ (perLesson.find((r) => r.status === 'rejected'))
        setEnrollmentsError(
          reason?.reason?.response?.data?.message || '수강 신청 목록을 불러오지 못했습니다.',
        )
      } else if (failedLessons > 0) {
        setEnrollmentsError('일부 교안의 수강 신청만 불러왔습니다.')
      }
    } catch (error) {
      setEnrolled([])
      setApplicants([])
      setEnrollmentsError(error.response?.data?.message || '수강 신청 목록을 불러오지 못했습니다.')
    } finally {
      setEnrollmentsLoading(false)
    }
  }, [])

  const loadPageData = useCallback(async () => {
    setLessonsLoading(true)
    setEnrollmentsLoading(true)
    setLessonsError('')
    setEnrollmentsError('')
    try {
      const res = await getLessonsForAdmin({ page: 0, size: 200, sort: 'createdAt,DESC' })
      const rows = lessonPageContent(res)
        .map(mapLessonToSummary)
        .filter(Boolean)
      setLessons(rows)
      await loadAllEnrollments(rows)
    } catch (error) {
      setLessons([])
      setEnrolled([])
      setApplicants([])
      setLessonsError(error.response?.data?.message || '교안 목록을 불러오지 못했습니다.')
      setEnrollmentsLoading(false)
    } finally {
      setLessonsLoading(false)
    }
  }, [loadAllEnrollments])

  useEffect(() => {
    void loadPageData()
  }, [loadPageData])

  const filteredLessons = useMemo(
    () => filterLessons(lessons, lessonSearchQuery),
    [lessons, lessonSearchQuery],
  )

  const enrolledForLesson = useMemo(
    () =>
      selectedLessonId ? enrolled.filter((row) => row.lessonId === selectedLessonId) : enrolled,
    [enrolled, selectedLessonId],
  )

  const applicantsForLesson = useMemo(
    () =>
      selectedLessonId ? applicants.filter((row) => row.lessonId === selectedLessonId) : applicants,
    [applicants, selectedLessonId],
  )

  const filteredEnrolled = useMemo(
    () => filterEnrollmentRows(enrolledForLesson, enrolledSearchQuery),
    [enrolledForLesson, enrolledSearchQuery],
  )

  const filteredApplicants = useMemo(
    () => filterEnrollmentRows(applicantsForLesson, applicantSearchQuery),
    [applicantsForLesson, applicantSearchQuery],
  )

  const lessonTableMsg = useMemo(
    () =>
      tableEmptyMessage({
        listLoading: lessonsLoading,
        listError: lessonsError,
        hasSelection: true,
        filteredCount: filteredLessons.length,
        totalCount: lessons.length,
        searchQuery: lessonSearchQuery,
        emptyLabels: {
          loading: '교안 목록을 불러오는 중…',
          noSelection: '',
          noData: '등록된 교안이 없습니다.',
          noSearch: '검색 결과가 없습니다.',
        },
      }),
    [lessonsLoading, lessonsError, filteredLessons.length, lessons.length, lessonSearchQuery],
  )

  const enrolledTableMsg = useMemo(
    () =>
      tableEmptyMessage({
        listLoading: enrollmentsLoading,
        listError: enrollmentsError,
        hasSelection: true,
        filteredCount: filteredEnrolled.length,
        totalCount: enrolledForLesson.length,
        searchQuery: enrolledSearchQuery,
        emptyLabels: {
          loading: '수강 학생 목록을 불러오는 중…',
          noSelection: '',
          noData: '승인된 수강 학생이 없습니다.',
          noSearch: '검색 결과가 없습니다.',
        },
      }),
    [
      enrollmentsLoading,
      enrollmentsError,
      filteredEnrolled.length,
      enrolledForLesson.length,
      enrolledSearchQuery,
    ],
  )

  const applicantTableMsg = useMemo(
    () =>
      tableEmptyMessage({
        listLoading: enrollmentsLoading,
        listError: enrollmentsError,
        hasSelection: true,
        filteredCount: filteredApplicants.length,
        totalCount: applicantsForLesson.length,
        searchQuery: applicantSearchQuery,
        emptyLabels: {
          loading: '신청 학생 목록을 불러오는 중…',
          noSelection: '',
          noData: '대기 중인 신청이 없습니다.',
          noSearch: '검색 결과가 없습니다.',
        },
      }),
    [
      enrollmentsLoading,
      enrollmentsError,
      filteredApplicants.length,
      applicantsForLesson.length,
      applicantSearchQuery,
    ],
  )

  const handleLessonSelect = (lessonId) => {
    setSelectedLessonId((prev) => (prev === lessonId ? null : lessonId))
    setSelectedApplicantKeys(new Set())
  }

  const toggleApplicant = (rowKey) => {
    setSelectedApplicantKeys((prev) => {
      const next = new Set(prev)
      if (next.has(rowKey)) next.delete(rowKey)
      else next.add(rowKey)
      return next
    })
  }

  const selectedApplicantRows = useMemo(
    () => applicantsForLesson.filter((row) => selectedApplicantKeys.has(enrollmentRowKey(row))),
    [applicantsForLesson, selectedApplicantKeys],
  )

  const handleApprove = async () => {
    if (selectedApplicantRows.length === 0) {
      window.alert('승인할 신청 학생을 선택해 주세요.')
      return
    }
    if (actionLoading) return

    setActionLoading(true)
    try {
      const results = await Promise.allSettled(
        selectedApplicantRows.map((row) =>
          approveLessonEnrollment(row.lessonId, row.enrollmentId),
        ),
      )
      const failed = results.filter((r) => r.status === 'rejected')
      await loadAllEnrollments(lessons)
      if (failed.length > 0) {
        const reason = /** @type {PromiseRejectedResult} */ (failed[0])
        window.alert(
          reason?.reason?.response?.data?.message ||
            `${failed.length}건 승인에 실패했습니다.`,
        )
      } else {
        const fulfilled = /** @type {PromiseFulfilledResult<import('axios').AxiosResponse>[]} */ (
          results.filter((r) => r.status === 'fulfilled')
        )
        window.alert(
          fulfilled[0]?.value?.data?.message || '선택한 수강 신청을 승인했습니다.',
        )
      }
    } catch (error) {
      window.alert(error.response?.data?.message || '승인 처리에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectApplicants = async () => {
    if (selectedApplicantRows.length === 0) {
      window.alert('거절할 신청 학생을 선택해 주세요.')
      return
    }
    if (actionLoading) return

    setActionLoading(true)
    try {
      const results = await Promise.allSettled(
        selectedApplicantRows.map((row) =>
          rejectLessonEnrollment(row.lessonId, row.enrollmentId),
        ),
      )
      const failed = results.filter((r) => r.status === 'rejected')
      await loadAllEnrollments(lessons)
      if (failed.length > 0) {
        const reason = /** @type {PromiseRejectedResult} */ (failed[0])
        window.alert(
          reason?.reason?.response?.data?.message ||
            `${failed.length}건 거절에 실패했습니다.`,
        )
      } else {
        const fulfilled = /** @type {PromiseFulfilledResult<import('axios').AxiosResponse>[]} */ (
          results.filter((r) => r.status === 'fulfilled')
        )
        window.alert(
          fulfilled[0]?.value?.data?.message || '선택한 수강 신청을 거절했습니다.',
        )
      }
    } catch (error) {
      window.alert(error.response?.data?.message || '거절 처리에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const enrollmentColgroup = (
    <colgroup>
      <col className="edu-admin-access__col-check" />
      <col className="edu-admin-access__col-lesson" />
      <col className="edu-admin-access__col-name" />
      <col className="edu-admin-access__col-nick" />
      <col className="edu-admin-access__col-date" />
    </colgroup>
  )

  const enrollmentTableHead = (/** @type {{ withCheckboxLabel: boolean }} */ { withCheckboxLabel }) => (
    <thead>
      <tr>
        <th scope="col" className="edu-admin-access__th-check" aria-hidden={!withCheckboxLabel}>
          {withCheckboxLabel ? <span className="edu-admin-access__sr-only">선택</span> : null}
        </th>
        <th scope="col">교안명</th>
        <th scope="col">학생명</th>
        <th scope="col">닉네임</th>
        <th scope="col">신청일</th>
      </tr>
    </thead>
  )

  const renderEnrollmentTable = (rows, emptyMsg, showCheckboxes, selectedKeys, onToggle) => {
    const showEmpty = emptyMsg !== null
    return (
      <div
        className={`edu-admin-access__table-body edu-admin-access__table-body--enrollment${showEmpty ? ' edu-admin-access__table-body--empty' : ''}`}
      >
        {showEmpty && emptyMsg ? (
          <p
            className={`edu-admin-access__empty-msg${emptyMsg.isError ? ' edu-admin-access__empty-msg--error' : ''}`}
            role={emptyMsg.isError ? 'alert' : 'status'}
          >
            {emptyMsg.text}
          </p>
        ) : (
          <table className="edu-admin-access__table edu-admin-access__table--enrollment">
            {enrollmentColgroup}
            <tbody>
              {rows.map((row) => {
                const rowKey = enrollmentRowKey(row)
                return (
                  <tr key={rowKey}>
                    <td className="edu-admin-access__cell-check">
                      {showCheckboxes ? (
                        <input
                          type="checkbox"
                          checked={selectedKeys.has(rowKey)}
                          onChange={() => onToggle(rowKey)}
                          aria-label={`${row.lessonName} ${row.name} 선택`}
                        />
                      ) : null}
                    </td>
                    <td title={row.lessonName}>{row.lessonName}</td>
                    <td title={row.name}>{row.name}</td>
                    <td title={row.nickname}>{row.nickname}</td>
                    <td title={row.requestedDate}>{row.requestedDate}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    )
  }

  const listsLoading = lessonsLoading || enrollmentsLoading

  return (
    <div className="edu-admin-access">
      <div className="edu-admin-access__grid">
        <section className="edu-admin-access__panel" aria-labelledby="admin-panel-lessons">
          <h2 id="admin-panel-lessons" className="edu-admin-access__col-head edu-admin-access__col-head--c1">
            교안
          </h2>
          <form
            className="edu-admin-access__search edu-admin-access__search--c1"
            onSubmit={(e) => {
              e.preventDefault()
              setLessonSearchQuery(lessonSearchInput)
            }}
          >
            <input
              type="search"
              className="edu-admin-access__search-input"
              placeholder="교안명, 담당 교수 검색"
              value={lessonSearchInput}
              onChange={(e) => setLessonSearchInput(e.target.value)}
              disabled={lessonsLoading}
              aria-label="교안 검색"
            />
            <Button
              type="submit"
              variant="primary"
              className="edu-admin-access__search-btn"
              disabled={lessonsLoading}
            >
              검색
            </Button>
          </form>
          <div className="edu-admin-access__table-wrap edu-admin-access__table-wrap--c1">
            <div className="edu-admin-access__table-area">
              <div className="edu-admin-access__table-head">
                <table className="edu-admin-access__table">
                  <caption className="edu-admin-access__caption">교안 목록</caption>
                  <colgroup>
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">교안명</th>
                      <th scope="col">담당 교수</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div
                className={`edu-admin-access__table-body${lessonTableMsg ? ' edu-admin-access__table-body--empty' : ''}`}
              >
                {lessonTableMsg ? (
                  <p
                    className={`edu-admin-access__empty-msg${lessonTableMsg.isError ? ' edu-admin-access__empty-msg--error' : ''}`}
                    role={lessonTableMsg.isError ? 'alert' : 'status'}
                  >
                    {lessonTableMsg.text}
                  </p>
                ) : (
                  <table className="edu-admin-access__table">
                    <colgroup>
                      <col />
                      <col />
                    </colgroup>
                    <tbody>
                      {filteredLessons.map((lesson) => {
                        const isSelected = lesson.id === selectedLessonId
                        return (
                          <tr
                            key={lesson.id}
                            className={`edu-admin-access__subject-tr${isSelected ? ' edu-admin-access__subject-tr--selected' : ''}`}
                          >
                            <td>
                              <button
                                type="button"
                                className="edu-admin-access__subject-select"
                                title={lesson.name}
                                onClick={() => handleLessonSelect(lesson.id)}
                              >
                                {lesson.name}
                              </button>
                            </td>
                            <td title={lesson.professorName}>{lesson.professorName}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          <div className="edu-admin-access__actions edu-admin-access__actions--c1" aria-hidden="true" />
        </section>

        <section className="edu-admin-access__panel" aria-labelledby="admin-panel-enrolled">
          <h2 id="admin-panel-enrolled" className="edu-admin-access__col-head edu-admin-access__col-head--c2">
            수강 학생 목록
          </h2>
          <form
            className="edu-admin-access__search edu-admin-access__search--c2"
            onSubmit={(e) => {
              e.preventDefault()
              setEnrolledSearchQuery(enrolledSearchInput)
            }}
          >
            <input
              type="search"
              className="edu-admin-access__search-input"
              placeholder="교안명, 학생명, 닉네임, 학생 ID 검색"
              value={enrolledSearchInput}
              onChange={(e) => setEnrolledSearchInput(e.target.value)}
              disabled={listsLoading}
              aria-label="수강 학생 검색"
            />
            <Button
              type="submit"
              variant="primary"
              className="edu-admin-access__search-btn"
              disabled={listsLoading}
            >
              검색
            </Button>
          </form>
          <div className="edu-admin-access__table-wrap edu-admin-access__table-wrap--c2">
            <div className="edu-admin-access__table-area">
              <div className="edu-admin-access__table-head">
                <table className="edu-admin-access__table edu-admin-access__table--enrollment">
                  <caption className="edu-admin-access__caption">승인된 수강 학생</caption>
                  {enrollmentColgroup}
                  {enrollmentTableHead({ withCheckboxLabel: false })}
                </table>
              </div>
              {renderEnrollmentTable(filteredEnrolled, enrolledTableMsg, false, new Set(), () => {})}
            </div>
          </div>
          <div className="edu-admin-access__actions edu-admin-access__actions--c2" aria-hidden="true" />
        </section>

        <section className="edu-admin-access__panel" aria-labelledby="admin-panel-applicants">
          <h2 id="admin-panel-applicants" className="edu-admin-access__col-head edu-admin-access__col-head--c3">
            신청 학생 목록
          </h2>
          <form
            className="edu-admin-access__search edu-admin-access__search--c3"
            onSubmit={(e) => {
              e.preventDefault()
              setApplicantSearchQuery(applicantSearchInput)
            }}
          >
            <input
              type="search"
              className="edu-admin-access__search-input"
              placeholder="교안명, 학생명, 닉네임, 학생 ID 검색"
              value={applicantSearchInput}
              onChange={(e) => setApplicantSearchInput(e.target.value)}
              disabled={listsLoading}
              aria-label="신청 학생 검색"
            />
            <Button
              type="submit"
              variant="primary"
              className="edu-admin-access__search-btn"
              disabled={listsLoading}
            >
              검색
            </Button>
          </form>
          <div className="edu-admin-access__table-wrap edu-admin-access__table-wrap--c3">
            <div className="edu-admin-access__table-area">
              <div className="edu-admin-access__table-head">
                <table className="edu-admin-access__table edu-admin-access__table--enrollment">
                  <caption className="edu-admin-access__caption">대기 중인 신청</caption>
                  {enrollmentColgroup}
                  {enrollmentTableHead({ withCheckboxLabel: true })}
                </table>
              </div>
              {renderEnrollmentTable(
                filteredApplicants,
                applicantTableMsg,
                true,
                selectedApplicantKeys,
                toggleApplicant,
              )}
            </div>
          </div>
          <div className="edu-admin-access__actions edu-admin-access__actions--c3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleRejectApplicants()}
              disabled={listsLoading || actionLoading}
            >
              {actionLoading ? '처리 중…' : '거절'}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void handleApprove()}
              disabled={listsLoading || actionLoading}
            >
              {actionLoading ? '처리 중…' : '승인'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

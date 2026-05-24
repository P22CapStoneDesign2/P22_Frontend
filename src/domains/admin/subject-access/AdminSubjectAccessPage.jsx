import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  approveLessonEnrollment,
  getAdminLessons,
  getLessonEnrollments,
  lessonPageContent,
  rejectLessonEnrollment,
} from '../../../api/lessons.js'
import Button from '../../../components/ui/Button/Button.jsx'
import {
  filterEnrollmentRows,
  filterSubjects,
  mapEnrollmentToRow,
  mapLessonToSubject,
  tableEmptyMessage,
} from './adminSubjectAccessUtils.js'
import './AdminSubjectAccessPage.css'

/**
 * 관리자 — 교안 수강 신청 관리 (§14·§30~§32)
 */
export default function AdminSubjectAccessPage() {
  const [subjects, setSubjects] = useState(/** @type {import('./adminSubjectAccessUtils.js').SubjectRow[]} */ ([]))
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [subjectsError, setSubjectsError] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState(/** @type {string | null} */ (null))

  const [enrolled, setEnrolled] = useState(/** @type {import('./adminSubjectAccessUtils.js').EnrollmentRow[]} */ ([]))
  const [applicants, setApplicants] = useState(/** @type {import('./adminSubjectAccessUtils.js').EnrollmentRow[]} */ ([]))
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false)
  const [enrollmentsError, setEnrollmentsError] = useState('')

  const [subjectSearchInput, setSubjectSearchInput] = useState('')
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('')
  const [enrolledSearchInput, setEnrolledSearchInput] = useState('')
  const [enrolledSearchQuery, setEnrolledSearchQuery] = useState('')
  const [applicantSearchInput, setApplicantSearchInput] = useState('')
  const [applicantSearchQuery, setApplicantSearchQuery] = useState('')

  const [selectedApplicantIds, setSelectedApplicantIds] = useState(() => new Set())
  const [actionLoading, setActionLoading] = useState(false)

  const loadSubjects = useCallback(async () => {
    setSubjectsLoading(true)
    setSubjectsError('')
    try {
      const res = await getAdminLessons({ page: 0, size: 200, sort: 'createdAt,DESC' })
      const rows = lessonPageContent(res)
        .map(mapLessonToSubject)
        .filter(Boolean)
      setSubjects(rows)
      setSelectedSubjectId((prev) => {
        if (prev && rows.some((s) => s.id === prev)) return prev
        return rows[0]?.id ?? null
      })
    } catch (error) {
      setSubjects([])
      setSelectedSubjectId(null)
      setSubjectsError(error.response?.data?.message || '교안 목록을 불러오지 못했습니다.')
    } finally {
      setSubjectsLoading(false)
    }
  }, [])

  const loadEnrollments = useCallback(async (lessonId) => {
    if (!lessonId) {
      setEnrolled([])
      setApplicants([])
      return
    }
    setEnrollmentsLoading(true)
    setEnrollmentsError('')
    try {
      const [approvedRes, pendingRes] = await Promise.all([
        getLessonEnrollments(lessonId, { status: 'APPROVED', page: 0, size: 200 }),
        getLessonEnrollments(lessonId, { status: 'PENDING', page: 0, size: 200 }),
      ])
      setEnrolled(
        lessonPageContent(approvedRes)
          .map(mapEnrollmentToRow)
          .filter(Boolean),
      )
      setApplicants(
        lessonPageContent(pendingRes)
          .map(mapEnrollmentToRow)
          .filter(Boolean),
      )
    } catch (error) {
      setEnrolled([])
      setApplicants([])
      setEnrollmentsError(error.response?.data?.message || '수강 신청 목록을 불러오지 못했습니다.')
    } finally {
      setEnrollmentsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSubjects()
  }, [loadSubjects])

  useEffect(() => {
    setSelectedApplicantIds(new Set())
    setEnrolledSearchInput('')
    setEnrolledSearchQuery('')
    setApplicantSearchInput('')
    setApplicantSearchQuery('')
    void loadEnrollments(selectedSubjectId)
  }, [selectedSubjectId, loadEnrollments])

  const filteredSubjects = useMemo(
    () => filterSubjects(subjects, subjectSearchQuery),
    [subjects, subjectSearchQuery],
  )

  const filteredEnrolled = useMemo(
    () => filterEnrollmentRows(enrolled, enrolledSearchQuery),
    [enrolled, enrolledSearchQuery],
  )

  const filteredApplicants = useMemo(
    () => filterEnrollmentRows(applicants, applicantSearchQuery),
    [applicants, applicantSearchQuery],
  )

  const subjectTableMsg = useMemo(
    () =>
      tableEmptyMessage({
        listLoading: subjectsLoading,
        listError: subjectsError,
        hasSelection: true,
        filteredCount: filteredSubjects.length,
        totalCount: subjects.length,
        searchQuery: subjectSearchQuery,
        emptyLabels: {
          loading: '교안 목록을 불러오는 중…',
          noSelection: '',
          noData: '등록된 교안이 없습니다.',
          noSearch: '검색 결과가 없습니다.',
        },
      }),
    [subjectsLoading, subjectsError, filteredSubjects.length, subjects.length, subjectSearchQuery],
  )

  const enrolledTableMsg = useMemo(
    () =>
      tableEmptyMessage({
        listLoading: enrollmentsLoading,
        listError: enrollmentsError,
        hasSelection: Boolean(selectedSubjectId),
        filteredCount: filteredEnrolled.length,
        totalCount: enrolled.length,
        searchQuery: enrolledSearchQuery,
        emptyLabels: {
          loading: '수강 학생 목록을 불러오는 중…',
          noSelection: '왼쪽에서 교안을 선택해 주세요.',
          noData: '승인된 수강 학생이 없습니다.',
          noSearch: '검색 결과가 없습니다.',
        },
      }),
    [
      enrollmentsLoading,
      enrollmentsError,
      selectedSubjectId,
      filteredEnrolled.length,
      enrolled.length,
      enrolledSearchQuery,
    ],
  )

  const applicantTableMsg = useMemo(
    () =>
      tableEmptyMessage({
        listLoading: enrollmentsLoading,
        listError: enrollmentsError,
        hasSelection: Boolean(selectedSubjectId),
        filteredCount: filteredApplicants.length,
        totalCount: applicants.length,
        searchQuery: applicantSearchQuery,
        emptyLabels: {
          loading: '신청 학생 목록을 불러오는 중…',
          noSelection: '왼쪽에서 교안을 선택해 주세요.',
          noData: '대기 중인 신청이 없습니다.',
          noSearch: '검색 결과가 없습니다.',
        },
      }),
    [
      enrollmentsLoading,
      enrollmentsError,
      selectedSubjectId,
      filteredApplicants.length,
      applicants.length,
      applicantSearchQuery,
    ],
  )

  const handleSubjectSelect = (subjectId) => {
    setSelectedSubjectId(subjectId)
  }

  const toggleApplicant = (enrollmentId) => {
    setSelectedApplicantIds((prev) => {
      const next = new Set(prev)
      if (next.has(enrollmentId)) next.delete(enrollmentId)
      else next.add(enrollmentId)
      return next
    })
  }

  const handleApprove = async () => {
    if (!selectedSubjectId) {
      window.alert('교안을 선택해 주세요.')
      return
    }
    if (selectedApplicantIds.size === 0) {
      window.alert('승인할 신청 학생을 선택해 주세요.')
      return
    }
    if (actionLoading) return

    setActionLoading(true)
    try {
      const ids = [...selectedApplicantIds]
      const results = await Promise.allSettled(
        ids.map((enrollmentId) => approveLessonEnrollment(selectedSubjectId, enrollmentId)),
      )
      const failed = results.filter((r) => r.status === 'rejected')
      await loadEnrollments(selectedSubjectId)
      setSelectedApplicantIds(new Set())
      if (failed.length > 0) {
        const reason = /** @type {PromiseRejectedResult} */ (failed[0]).reason
        window.alert(
          reason?.response?.data?.message ||
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
    if (!selectedSubjectId) {
      window.alert('교안을 선택해 주세요.')
      return
    }
    if (selectedApplicantIds.size === 0) {
      window.alert('거절할 신청 학생을 선택해 주세요.')
      return
    }
    if (actionLoading) return

    setActionLoading(true)
    try {
      const ids = [...selectedApplicantIds]
      const results = await Promise.allSettled(
        ids.map((enrollmentId) => rejectLessonEnrollment(selectedSubjectId, enrollmentId)),
      )
      const failed = results.filter((r) => r.status === 'rejected')
      await loadEnrollments(selectedSubjectId)
      setSelectedApplicantIds(new Set())
      if (failed.length > 0) {
        const reason = /** @type {PromiseRejectedResult} */ (failed[0]).reason
        window.alert(
          reason?.response?.data?.message ||
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
      <col className="edu-admin-access__col-name" />
      <col className="edu-admin-access__col-nick" />
      <col className="edu-admin-access__col-date" />
      <col className="edu-admin-access__col-date" />
    </colgroup>
  )

  const enrollmentTableHead = (/** @type {{ withCheckboxLabel: boolean }} */ { withCheckboxLabel }) => (
    <thead>
      <tr>
        <th scope="col" className="edu-admin-access__th-check" aria-hidden={!withCheckboxLabel}>
          {withCheckboxLabel ? <span className="edu-admin-access__sr-only">선택</span> : null}
        </th>
        <th scope="col">학생명</th>
        <th scope="col">닉네임</th>
        <th scope="col">신청일</th>
        <th scope="col">승인일</th>
      </tr>
    </thead>
  )

  const renderEnrollmentTable = (rows, emptyMsg, showCheckboxes, selectedIds, onToggle) => {
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
              {rows.map((row) => (
                <tr key={row.enrollmentId}>
                  <td className="edu-admin-access__cell-check">
                    {showCheckboxes ? (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.enrollmentId)}
                        onChange={() => onToggle(row.enrollmentId)}
                        aria-label={`${row.name} 선택`}
                      />
                    ) : null}
                  </td>
                  <td>{row.name}</td>
                  <td>{row.nickname}</td>
                  <td>{row.requestedDate}</td>
                  <td>{row.decidedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }

  return (
    <div className="edu-admin-access">
      <div className="edu-admin-access__grid">
        <section className="edu-admin-access__panel" aria-labelledby="admin-panel-subjects">
          <h2 id="admin-panel-subjects" className="edu-admin-access__col-head edu-admin-access__col-head--c1">
            교안
          </h2>
          <form
            className="edu-admin-access__search edu-admin-access__search--c1"
            onSubmit={(e) => {
              e.preventDefault()
              setSubjectSearchQuery(subjectSearchInput)
            }}
          >
            <input
              type="search"
              className="edu-admin-access__search-input"
              placeholder="교안명, 담당 교수 검색"
              value={subjectSearchInput}
              onChange={(e) => setSubjectSearchInput(e.target.value)}
              disabled={subjectsLoading}
              aria-label="교안 검색"
            />
            <Button
              type="submit"
              variant="primary"
              className="edu-admin-access__search-btn"
              disabled={subjectsLoading}
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
                className={`edu-admin-access__table-body${subjectTableMsg ? ' edu-admin-access__table-body--empty' : ''}`}
              >
                {subjectTableMsg ? (
                  <p
                    className={`edu-admin-access__empty-msg${subjectTableMsg.isError ? ' edu-admin-access__empty-msg--error' : ''}`}
                    role={subjectTableMsg.isError ? 'alert' : 'status'}
                  >
                    {subjectTableMsg.text}
                  </p>
                ) : (
                  <table className="edu-admin-access__table">
                    <colgroup>
                      <col />
                      <col />
                    </colgroup>
                    <tbody>
                      {filteredSubjects.map((subject) => {
                        const isSelected = subject.id === selectedSubjectId
                        return (
                          <tr
                            key={subject.id}
                            className={`edu-admin-access__subject-tr${isSelected ? ' edu-admin-access__subject-tr--selected' : ''}`}
                          >
                            <td>
                              <button
                                type="button"
                                className="edu-admin-access__subject-select"
                                onClick={() => handleSubjectSelect(subject.id)}
                              >
                                {subject.name}
                              </button>
                            </td>
                            <td>{subject.professorName}</td>
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
              placeholder="학생명, 닉네임, 학생 ID 검색"
              value={enrolledSearchInput}
              onChange={(e) => setEnrolledSearchInput(e.target.value)}
              disabled={!selectedSubjectId || enrollmentsLoading}
              aria-label="수강 학생 검색"
            />
            <Button
              type="submit"
              variant="primary"
              className="edu-admin-access__search-btn"
              disabled={!selectedSubjectId || enrollmentsLoading}
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
              placeholder="학생명, 닉네임, 학생 ID 검색"
              value={applicantSearchInput}
              onChange={(e) => setApplicantSearchInput(e.target.value)}
              disabled={!selectedSubjectId || enrollmentsLoading}
              aria-label="신청 학생 검색"
            />
            <Button
              type="submit"
              variant="primary"
              className="edu-admin-access__search-btn"
              disabled={!selectedSubjectId || enrollmentsLoading}
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
                selectedApplicantIds,
                toggleApplicant,
              )}
            </div>
          </div>
          <div className="edu-admin-access__actions edu-admin-access__actions--c3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleRejectApplicants()}
              disabled={!selectedSubjectId || enrollmentsLoading || actionLoading}
            >
              {actionLoading ? '처리 중…' : '거절'}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void handleApprove()}
              disabled={!selectedSubjectId || enrollmentsLoading || actionLoading}
            >
              {actionLoading ? '처리 중…' : '승인'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

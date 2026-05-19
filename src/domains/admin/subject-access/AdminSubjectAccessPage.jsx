import { useMemo, useState } from 'react'
import Button from '../../../components/ui/Button/Button.jsx'
import './AdminSubjectAccessPage.css'

/** @typedef {{ id: string, name: string, professorName: string }} Subject */
/** @typedef {{ id: string, name: string, loginId: string, nickname: string, joinedDate: string }} StudentRow */

/** mock — API 연동 전 목업 데이터 */
const MOCK_SUBJECTS = [
  { id: 'subj-1', name: '컴퓨터 구조와 알고리즘', professorName: '김수미' },
  { id: 'subj-2', name: '인공지능개론', professorName: '김수미' },
]

/** @type {Record<string, { enrolled: StudentRow[], applicants: StudentRow[] }>} */
const MOCK_STUDENTS_BY_SUBJECT = {
  'subj-1': {
    enrolled: [
      {
        id: 'stu-1',
        name: '홍길동',
        loginId: 'hong@school.edu',
        nickname: '길동이',
        joinedDate: '2026-03-01',
      },
    ],
    applicants: [
      {
        id: 'stu-2',
        name: '김서현',
        loginId: 'seohyun@school.edu',
        nickname: '서현',
        joinedDate: '2026-04-10',
      },
      {
        id: 'stu-3',
        name: '이순신',
        loginId: 'yi@school.edu',
        nickname: '충무공',
        joinedDate: '2026-04-11',
      },
      {
        id: 'stu-4',
        name: 'jennysue',
        loginId: 'jenny@school.edu',
        nickname: 'jenny',
        joinedDate: '2026-04-12',
      },
    ],
  },
  'subj-2': {
    enrolled: [],
    applicants: [],
  },
}

function matchesQuery(text, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return String(text ?? '')
    .toLowerCase()
    .includes(q)
}

function filterSubjects(subjects, query) {
  const q = query.trim().toLowerCase()
  if (!q) return subjects
  return subjects.filter(
    (s) => matchesQuery(s.name, q) || matchesQuery(s.professorName, q),
  )
}

function filterStudents(rows, query) {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter(
    (row) =>
      matchesQuery(row.name, q) ||
      matchesQuery(row.loginId, q) ||
      matchesQuery(row.nickname, q),
  )
}

/**
 * 관리자 — 과목 접근 권한 관리 (UI 뼈대, mock 데이터)
 */
export default function AdminSubjectAccessPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState(MOCK_SUBJECTS[0]?.id ?? null)
  const [subjectSearchInput, setSubjectSearchInput] = useState('')
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('')
  const [enrolledSearchInput, setEnrolledSearchInput] = useState('')
  const [enrolledSearchQuery, setEnrolledSearchQuery] = useState('')
  const [applicantSearchInput, setApplicantSearchInput] = useState('')
  const [applicantSearchQuery, setApplicantSearchQuery] = useState('')
  const [selectedEnrolledIds, setSelectedEnrolledIds] = useState(() => new Set())
  const [selectedApplicantIds, setSelectedApplicantIds] = useState(() => new Set())

  const filteredSubjects = useMemo(
    () => filterSubjects(MOCK_SUBJECTS, subjectSearchQuery),
    [subjectSearchQuery],
  )

  const studentBundle = selectedSubjectId
    ? MOCK_STUDENTS_BY_SUBJECT[selectedSubjectId]
    : { enrolled: [], applicants: [] }

  const filteredEnrolled = useMemo(
    () => filterStudents(studentBundle.enrolled, enrolledSearchQuery),
    [studentBundle.enrolled, enrolledSearchQuery],
  )

  const filteredApplicants = useMemo(
    () => filterStudents(studentBundle.applicants, applicantSearchQuery),
    [studentBundle.applicants, applicantSearchQuery],
  )

  const handleSubjectSelect = (subjectId) => {
    setSelectedSubjectId(subjectId)
    setSelectedEnrolledIds(new Set())
    setSelectedApplicantIds(new Set())
    setEnrolledSearchInput('')
    setEnrolledSearchQuery('')
    setApplicantSearchInput('')
    setApplicantSearchQuery('')
  }

  const toggleEnrolled = (id) => {
    setSelectedEnrolledIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleApplicant = (id) => {
    setSelectedApplicantIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleApprove = () => {
    if (selectedApplicantIds.size === 0) {
      window.alert('승인할 신청 학생을 선택해 주세요.')
      return
    }
    window.alert('승인 API 연동 전입니다. (선택: mock)')
  }

  const handleDeleteEnrolled = () => {
    if (selectedEnrolledIds.size === 0) {
      window.alert('삭제할 수강 학생을 선택해 주세요.')
      return
    }
    window.alert('삭제 API 연동 전입니다. (선택: mock)')
  }

  return (
    <div className="edu-admin-access">
      <h1 className="edu-admin-access__page-title">과목 접근 권한 관리</h1>

      <div className="edu-admin-access__grid">
        <section className="edu-admin-access__panel" aria-labelledby="admin-panel-subjects">
          <h2 id="admin-panel-subjects" className="edu-admin-access__col-head edu-admin-access__col-head--c1">
            과목
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
              placeholder="과목명, 담당 교수 검색 가능"
              value={subjectSearchInput}
              onChange={(e) => setSubjectSearchInput(e.target.value)}
              aria-label="과목 검색"
            />
            <Button type="submit" variant="primary" className="edu-admin-access__search-btn">
              검색
            </Button>
          </form>
          <div className="edu-admin-access__table-wrap edu-admin-access__table-wrap--c1">
            <div className="edu-admin-access__table-area">
              <div className="edu-admin-access__table-head">
                <table className="edu-admin-access__table">
                  <caption className="edu-admin-access__caption">과목 목록</caption>
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
                className={`edu-admin-access__table-body${filteredSubjects.length === 0 ? ' edu-admin-access__table-body--empty' : ''}`}
              >
                {filteredSubjects.length === 0 ? (
                  <p className="edu-admin-access__empty-msg">검색 결과가 없습니다.</p>
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
              placeholder="학생명, 가입 아이디, 닉네임 검색 가능"
              value={enrolledSearchInput}
              onChange={(e) => setEnrolledSearchInput(e.target.value)}
              disabled={!selectedSubjectId}
              aria-label="수강 학생 검색"
            />
            <Button
              type="submit"
              variant="primary"
              className="edu-admin-access__search-btn"
              disabled={!selectedSubjectId}
            >
              검색
            </Button>
          </form>
          <div className="edu-admin-access__table-wrap edu-admin-access__table-wrap--c2">
            <div className="edu-admin-access__table-area">
              <div className="edu-admin-access__table-head">
                <table className="edu-admin-access__table">
                  <caption className="edu-admin-access__caption">수강 학생</caption>
                  <colgroup>
                    <col className="edu-admin-access__col-check" />
                    <col />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col" className="edu-admin-access__th-check">
                        <span className="edu-admin-access__sr-only">선택</span>
                      </th>
                      <th scope="col">학생명</th>
                      <th scope="col">가입 아이디</th>
                      <th scope="col">닉네임</th>
                      <th scope="col">가입일</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div
                className={`edu-admin-access__table-body${
                  !selectedSubjectId || filteredEnrolled.length === 0
                    ? ' edu-admin-access__table-body--empty'
                    : ''
                }`}
              >
                {!selectedSubjectId ? (
                  <p className="edu-admin-access__empty-msg">왼쪽에서 과목을 선택해 주세요.</p>
                ) : filteredEnrolled.length === 0 ? (
                  <p className="edu-admin-access__empty-msg">수강 중인 학생이 없습니다.</p>
                ) : (
                <table className="edu-admin-access__table">
                  <colgroup>
                    <col className="edu-admin-access__col-check" />
                    <col />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <tbody>
                  {filteredEnrolled.map((row) => (
                    <tr key={row.id}>
                      <td className="edu-admin-access__cell-check">
                        <input
                          type="checkbox"
                          checked={selectedEnrolledIds.has(row.id)}
                          onChange={() => toggleEnrolled(row.id)}
                          aria-label={`${row.name} 선택`}
                        />
                      </td>
                      <td>{row.name}</td>
                      <td>{row.loginId}</td>
                      <td>{row.nickname}</td>
                      <td>{row.joinedDate}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>
          </div>
          <div className="edu-admin-access__actions edu-admin-access__actions--c2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDeleteEnrolled}
              disabled={!selectedSubjectId}
            >
              삭제
            </Button>
          </div>
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
              placeholder="학생명, 가입 아이디, 닉네임 검색 가능"
              value={applicantSearchInput}
              onChange={(e) => setApplicantSearchInput(e.target.value)}
              disabled={!selectedSubjectId}
              aria-label="신청 학생 검색"
            />
            <Button
              type="submit"
              variant="primary"
              className="edu-admin-access__search-btn"
              disabled={!selectedSubjectId}
            >
              검색
            </Button>
          </form>
          <div className="edu-admin-access__table-wrap edu-admin-access__table-wrap--c3">
            <div className="edu-admin-access__table-area">
              <div className="edu-admin-access__table-head">
                <table className="edu-admin-access__table">
                  <caption className="edu-admin-access__caption">신청 학생</caption>
                  <colgroup>
                    <col className="edu-admin-access__col-check" />
                    <col />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col" className="edu-admin-access__th-check" aria-hidden="true" />
                      <th scope="col">학생명</th>
                      <th scope="col">가입 아이디</th>
                      <th scope="col">닉네임</th>
                      <th scope="col">가입일</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div
                className={`edu-admin-access__table-body${
                  !selectedSubjectId || filteredApplicants.length === 0
                    ? ' edu-admin-access__table-body--empty'
                    : ''
                }`}
              >
                {!selectedSubjectId ? (
                  <p className="edu-admin-access__empty-msg">왼쪽에서 과목을 선택해 주세요.</p>
                ) : filteredApplicants.length === 0 ? (
                  <p className="edu-admin-access__empty-msg">신청한 학생이 없습니다.</p>
                ) : (
                <table className="edu-admin-access__table">
                  <colgroup>
                    <col className="edu-admin-access__col-check" />
                    <col />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <tbody>
                  {filteredApplicants.map((row) => (
                    <tr key={row.id}>
                      <td className="edu-admin-access__cell-check">
                        <input
                          type="checkbox"
                          checked={selectedApplicantIds.has(row.id)}
                          onChange={() => toggleApplicant(row.id)}
                          aria-label={`${row.name} 선택`}
                        />
                      </td>
                      <td>{row.name}</td>
                      <td>{row.loginId}</td>
                      <td>{row.nickname}</td>
                      <td>{row.joinedDate}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>
          </div>
          <div className="edu-admin-access__actions edu-admin-access__actions--c3">
            <Button
              type="button"
              variant="primary"
              onClick={handleApprove}
              disabled={!selectedSubjectId}
            >
              승인
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

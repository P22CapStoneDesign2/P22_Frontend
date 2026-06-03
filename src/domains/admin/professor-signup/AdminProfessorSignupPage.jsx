import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  adminUserPageContent,
  approveProfessorSignup,
  fetchAdminProfessorSignupsForPage,
  rejectProfessorSignup,
} from '../../../api/adminUsers.js'
import Button from '../../../components/ui/Button/Button.jsx'
import {
  filterProfSignupRows,
  mapProfessorSignupToRow,
  tableEmptyMessage,
} from './adminProfessorSignupUtils.js'
import '../subject-access/AdminSubjectAccessPage.css'
import './AdminProfessorSignupPage.css'

/**
 * 관리자 — 교수 회원가입 승인 (§33~§35)
 */
export default function AdminProfessorSignupPage() {
  const [rows, setRows] = useState(/** @type {import('./adminProfessorSignupUtils.js').ProfSignupRow[]} */ ([]))
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState(() => new Set())
  const [actionLoading, setActionLoading] = useState(false)

  const loadPendingSignups = useCallback(async () => {
    setListLoading(true)
    setListError('')
    try {
      const res = await fetchAdminProfessorSignupsForPage()
      const mapped = adminUserPageContent(res)
        .map(mapProfessorSignupToRow)
        .filter(Boolean)
        .filter((row) => row.status === 'PENDING')
      setRows(mapped)
      setSelectedUserIds(new Set())
    } catch (error) {
      setRows([])
      setSelectedUserIds(new Set())
      setListError(error.response?.data?.message || '교수 가입 신청 목록을 불러오지 못했습니다.')
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPendingSignups()
  }, [loadPendingSignups])

  const filteredRows = useMemo(() => filterProfSignupRows(rows, searchQuery), [rows, searchQuery])

  const tableMsg = tableEmptyMessage({
    listLoading,
    listError,
    filteredCount: filteredRows.length,
    totalCount: rows.length,
    searchQuery,
    emptyLabels: {
      loading: '목록을 불러오는 중…',
      noData: '승인 대기 중인 교수 가입 신청이 없습니다.',
      noSearch: '검색 결과가 없습니다.',
    },
  })

  const toggleRow = (userId) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const handleApprove = async () => {
    const ids = [...selectedUserIds]
    if (ids.length === 0) {
      window.alert('승인할 교수 가입 신청을 선택해 주세요.')
      return
    }
    setActionLoading(true)
    try {
      const results = await Promise.allSettled(ids.map((id) => approveProfessorSignup(id)))
      const failed = results.filter((r) => r.status === 'rejected')
      await loadPendingSignups()
      if (failed.length > 0) {
        window.alert(`${failed.length}건 승인에 실패했습니다.`)
        return
      }
      const fulfilled = results.filter((r) => r.status === 'fulfilled')
      const message =
        fulfilled[0]?.value?.data?.message || '선택한 교수 가입 신청을 승인했습니다.'
      window.alert(message)
    } catch (error) {
      window.alert(error.response?.data?.message || '승인 처리에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    const ids = [...selectedUserIds]
    if (ids.length === 0) {
      window.alert('거절할 교수 가입 신청을 선택해 주세요.')
      return
    }
    setActionLoading(true)
    try {
      const results = await Promise.allSettled(ids.map((id) => rejectProfessorSignup(id)))
      const failed = results.filter((r) => r.status === 'rejected')
      await loadPendingSignups()
      if (failed.length > 0) {
        window.alert(`${failed.length}건 거절에 실패했습니다.`)
        return
      }
      const fulfilled = results.filter((r) => r.status === 'fulfilled')
      const message =
        fulfilled[0]?.value?.data?.message || '선택한 교수 가입 신청을 거절했습니다.'
      window.alert(message)
    } catch (error) {
      window.alert(error.response?.data?.message || '거절 처리에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="edu-admin-access edu-admin-prof-signup">
      <div className="edu-admin-prof-signup__panel">
        <h2 className="edu-admin-access__col-head edu-admin-prof-signup__head">승인 대기 목록</h2>

        <form
          className="edu-admin-access__search edu-admin-prof-signup__search"
          onSubmit={(e) => {
            e.preventDefault()
            setSearchQuery(searchInput)
          }}
        >
          <input
            className="edu-admin-access__search-input"
            type="search"
            placeholder="이름·이메일·닉네임 검색"
            aria-label="교수 가입 신청 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={listLoading}
          />
          <Button type="submit" variant="secondary" className="edu-admin-access__search-btn" disabled={listLoading}>
            검색
          </Button>
        </form>

        <div className="edu-admin-access__table-wrap edu-admin-prof-signup__table-wrap">
          <div className="edu-admin-access__table-area">
            <div className="edu-admin-access__table-head">
              <table className="edu-admin-access__table edu-admin-access__table--enrollment">
                <caption className="edu-admin-access__caption">교수 가입 신청</caption>
                <colgroup>
                  <col className="edu-admin-access__col-check" />
                  <col className="edu-admin-access__col-name" />
                  <col />
                  <col className="edu-admin-access__col-nick" />
                  <col className="edu-admin-access__col-date" />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col" className="edu-admin-access__th-check">
                      <span className="edu-admin-access__sr-only">선택</span>
                    </th>
                    <th scope="col">이름</th>
                    <th scope="col">이메일</th>
                    <th scope="col">닉네임</th>
                    <th scope="col">신청일</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div
              className={`edu-admin-access__table-body edu-admin-access__table-body--enrollment${tableMsg ? ' edu-admin-access__table-body--empty' : ''}`}
            >
              {tableMsg ? (
                <p
                  className={`edu-admin-access__empty-msg${tableMsg.isError ? ' edu-admin-access__empty-msg--error' : ''}`}
                  role={tableMsg.isError ? 'alert' : 'status'}
                >
                  {tableMsg.text}
                </p>
              ) : (
                <table className="edu-admin-access__table edu-admin-access__table--enrollment">
                  <colgroup>
                    <col className="edu-admin-access__col-check" />
                    <col className="edu-admin-access__col-name" />
                    <col />
                    <col className="edu-admin-access__col-nick" />
                    <col className="edu-admin-access__col-date" />
                  </colgroup>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.userId}>
                        <td className="edu-admin-access__cell-check">
                          <input
                            type="checkbox"
                            aria-label={`${row.name} 선택`}
                            checked={selectedUserIds.has(row.userId)}
                            disabled={actionLoading}
                            onChange={() => toggleRow(row.userId)}
                          />
                        </td>
                        <td>{row.name}</td>
                        <td>{row.email}</td>
                        <td>{row.nickname}</td>
                        <td>{row.requestedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="edu-admin-access__actions edu-admin-prof-signup__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleReject()}
            disabled={listLoading || actionLoading}
          >
            {actionLoading ? '처리 중…' : '거절'}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => void handleApprove()}
            disabled={listLoading || actionLoading}
          >
            {actionLoading ? '처리 중…' : '승인'}
          </Button>
        </div>
      </div>
    </div>
  )
}

import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectDropdown from '../../../components/ui/SelectDropdown/SelectDropdown.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import QuizTable from './QuizTable.jsx'
import { deleteQuiz, getQuizzes } from '../../quiz/api/quizApi.js'
import { mapQuizListPageDataToTableRows } from '../../quiz/mappers/quizManagementMapper.js'
import './QuizManagementPage.css'

// 강의·교안 목록 API는 별도 작업(TD-FE-008 예정)이라 아직 mock을 유지한다.
const MOCK_COURSES = [
  { value: 'course-ds', label: '자료구조' },
  { value: 'course-algo', label: '알고리즘' },
]

const ALL_MATERIALS = [
  { value: 'mat-ds-w1', label: '자료구조 1주차', courseId: 'course-ds' },
  { value: 'mat-ds-w2', label: '자료구조 2주차', courseId: 'course-ds' },
  { value: 'mat-algo-intro', label: '알고리즘 개론', courseId: 'course-algo' },
]

function materialsForCourse(courseValue) {
  return ALL_MATERIALS.filter((m) => m.courseId === courseValue)
}

const QUIZ_PAGE_SIZE = 20

/**
 * 교안별 퀴즈 관리 본문: 강의/교안 선택, 퀴즈 목록, 생성·편집·삭제.
 *
 * 백엔드 `GET /api/quiz`는 현재 교안별 필터를 지원하지 않아 교안 선택 시 전체 퀴즈 목록을 불러온다.
 * 교안 단위 필터 API가 추가되면 `getQuizzes` 호출 파라미터와 매퍼만 교체한다. (mapper TODO 참고)
 */
export default function QuizManagementContent() {
  const navigate = useNavigate()

  const [courses] = useState(MOCK_COURSES)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [materials, setMaterials] = useState([])
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false)

  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchQuizzes = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await getQuizzes({ page: 0, size: QUIZ_PAGE_SIZE })
      setQuizzes(mapQuizListPageDataToTableRows(res.data?.data))
    } catch (e) {
      setQuizzes([])
      setErrorMessage(e?.response?.data?.message || e?.message || '퀴즈 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCourseSelect = (option) => {
    setSelectedCourse(option)
    setMaterials(materialsForCourse(option.value))
    setSelectedMaterial(null)
    setQuizzes([])
    setErrorMessage('')
  }

  const handleMaterialSelect = async (option) => {
    setSelectedMaterial(option)
    await fetchQuizzes()
  }

  const handleCreateQuiz = () => {
    if (!selectedMaterial) return
    navigate(`/professor/materials/${selectedMaterial.value}/quizzes/create`)
  }

  const handleViewQuiz = (quizId) => {
    navigate(`/professor/quizzes/${quizId}/edit`)
  }

  const handleRequestDelete = (quiz) => {
    setPendingDelete(quiz)
  }

  const handleCancelDelete = () => {
    if (deleting) return
    setPendingDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    setErrorMessage('')
    try {
      await deleteQuiz(pendingDelete.id)
      setPendingDelete(null)
      await fetchQuizzes()
    } catch (e) {
      setErrorMessage(e?.response?.data?.message || e?.message || '퀴즈를 삭제하지 못했습니다.')
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const materialSelectDisabled = !selectedCourse
  const materialPlaceholder = selectedCourse ? '교안을 선택하세요' : '먼저 강의를 선택하세요'

  return (
    <div className="edu-quiz-mgmt">
      <div className="edu-quiz-mgmt__card">
        <h1 className="edu-quiz-mgmt__title">교안별 퀴즈 관리</h1>

        <div className="edu-quiz-mgmt__filters">
          <div className="edu-quiz-mgmt__field">
            <span className="edu-quiz-mgmt__label" id="quiz-mgmt-course-label">
              강의
            </span>
            <SelectDropdown
              className="edu-quiz-mgmt__select"
              options={courses}
              selected={selectedCourse}
              placeholder="강의를 선택하세요"
              isOpen={courseDropdownOpen}
              onOpenChange={setCourseDropdownOpen}
              onSelect={handleCourseSelect}
              emptyMessage="등록된 강의가 없습니다."
            />
          </div>

          <div className="edu-quiz-mgmt__field">
            <span className="edu-quiz-mgmt__label" id="quiz-mgmt-material-label">
              교안
            </span>
            <SelectDropdown
              className="edu-quiz-mgmt__select"
              options={materials}
              selected={selectedMaterial}
              placeholder={materialPlaceholder}
              isOpen={materialDropdownOpen}
              onOpenChange={setMaterialDropdownOpen}
              onSelect={handleMaterialSelect}
              disabled={materialSelectDisabled}
              emptyMessage="이 강의에 등록된 교안이 없습니다."
            />
          </div>
        </div>

        <div
          className={`edu-quiz-mgmt__info-bar${selectedMaterial ? '' : ' edu-quiz-mgmt__info-bar--muted'}`}
          role="status"
          aria-live="polite"
        >
          {selectedMaterial ? (
            <>
              <span className="edu-quiz-mgmt__info-prefix">선택된 교안:</span>{' '}
              <strong className="edu-quiz-mgmt__info-strong">{selectedMaterial.label}</strong>
            </>
          ) : (
            <span>교안을 선택하면 정보가 표시됩니다.</span>
          )}
        </div>

        <div className="edu-quiz-mgmt__toolbar">
          <Button
            type="button"
            variant="primary"
            disabled={!selectedMaterial}
            onClick={handleCreateQuiz}
          >
            퀴즈 생성
          </Button>
        </div>

        {!selectedMaterial ? (
          <p className="edu-quiz-mgmt__hint">교안을 선택하면 해당 교안의 퀴즈 목록이 표시됩니다.</p>
        ) : loading ? (
          <p className="edu-quiz-mgmt__hint" role="status" aria-live="polite">
            퀴즈 목록을 불러오는 중입니다…
          </p>
        ) : errorMessage ? (
          <p className="edu-quiz-mgmt__hint edu-quiz-mgmt__hint--error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {selectedMaterial && !loading && !errorMessage ? (
          <QuizTable
            quizzes={quizzes}
            onViewQuiz={handleViewQuiz}
            onDeleteQuiz={handleRequestDelete}
          />
        ) : null}
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="퀴즈 삭제"
        message={
          pendingDelete
            ? `"${pendingDelete.question || pendingDelete.id}" 퀴즈를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
            : ''
        }
        confirmText="삭제"
        cancelText="취소"
        confirmVariant="danger"
        isConfirmLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

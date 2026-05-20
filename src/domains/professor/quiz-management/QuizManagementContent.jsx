import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SelectDropdown from '../../../components/ui/SelectDropdown/SelectDropdown.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import { useIsViewerMode } from '../../../shared/auth/useUserRole.js'
import {
  ROUTES,
  professorQuizCreatePath,
  professorQuizEditPath,
} from '../../../shared/constants/routes.js'
import {
  deleteQuestionsForMaterial,
  loadQuizTableRowsForMaterial,
} from '../../quiz/storage/professorQuizzesStorage.js'
import {
  countSavedMaterials,
  courseOptionsFromDto,
  loadProfessorMaterialsDto,
  materialOptionsForCourseFromDto,
} from '../materials/professorMaterialsStorage.js'
import { restoreQuizManagementSelection } from './quizManagementRestore.js'
import QuizTable from './QuizTable.jsx'
import './QuizManagementPage.css'

const NO_MATERIALS_MESSAGE =
  '등록된 교안이 없습니다. 교안을 먼저 설정해야 합니다. 교안 관리 페이지로 이동하시겠습니까?'

const DELETE_CONFIRM_MESSAGE = '선택한 퀴즈를 삭제하시겠습니까?'

function readQuizManagementBootstrap(locationState) {
  const dto = loadProfessorMaterialsDto()
  const hasMaterials = countSavedMaterials(dto) > 0
  const restored = hasMaterials
    ? restoreQuizManagementSelection(dto, locationState)
    : null

  return {
    materialsDto: dto,
    courses: hasMaterials ? courseOptionsFromDto(dto) : [],
    isNoMaterialsModalOpen: !hasMaterials,
    restored,
  }
}

export default function QuizManagementContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isViewerMode } = useIsViewerMode()

  const [bootstrap] = useState(() => readQuizManagementBootstrap(location.state))
  const materialsDto = bootstrap.materialsDto

  const [courses] = useState(bootstrap.courses)
  const [selectedCourse, setSelectedCourse] = useState(
    bootstrap.restored?.selectedCourse ?? null,
  )
  const [materials, setMaterials] = useState(bootstrap.restored?.materials ?? [])
  const [selectedMaterial, setSelectedMaterial] = useState(
    bootstrap.restored?.selectedMaterial ?? null,
  )
  const [quizzes, setQuizzes] = useState(bootstrap.restored?.quizzes ?? [])
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(() => new Set())

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false)
  const [isNoMaterialsModalOpen, setIsNoMaterialsModalOpen] = useState(
    bootstrap.isNoMaterialsModalOpen,
  )
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const selectedCount = selectedQuestionIds.size
  const canOpenDelete = Boolean(selectedMaterial) && !isDeleting

  const selectedDeleteItems = useMemo(() => {
    if (!selectedMaterial) return []
    return quizzes
      .filter((row) => selectedQuestionIds.has(row.questionId))
      .map((row) => ({ quizSetId: row.quizSetId, questionId: row.questionId }))
  }, [quizzes, selectedQuestionIds, selectedMaterial])

  const clearSelection = () => {
    setSelectedQuestionIds(new Set())
  }

  const refreshQuizzes = () => {
    if (!selectedMaterial) {
      setQuizzes([])
      return
    }
    setQuizzes(loadQuizTableRowsForMaterial(selectedMaterial.value))
  }

  const handleCourseSelect = (option) => {
    setSelectedCourse(option)
    setMaterials(materialOptionsForCourseFromDto(materialsDto, option.value))
    setSelectedMaterial(null)
    setQuizzes([])
    clearSelection()
  }

  const handleMaterialSelect = (option) => {
    setSelectedMaterial(option)
    setQuizzes(loadQuizTableRowsForMaterial(option.value))
    clearSelection()
  }

  const handleToggleQuestion = (questionId) => {
    if (isDeleting) return
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  const handleToggleAll = (checked) => {
    if (isDeleting) return
    if (!checked) {
      clearSelection()
      return
    }
    setSelectedQuestionIds(new Set(quizzes.map((q) => q.questionId)))
  }

  const handleCreateQuiz = () => {
    if (isViewerMode) return
    if (!selectedMaterial) return
    navigate(professorQuizCreatePath(selectedMaterial.value))
  }

  const handleViewQuiz = (quizSetId, questionId) => {
    const mid = selectedMaterial?.value ?? null
    navigate(professorQuizEditPath(quizSetId), {
      state: {
        materialId: mid,
        initialActiveQuestionId: questionId,
        selectedMaterialId: mid,
      },
    })
  }

  const handleOpenDeleteModal = () => {
    if (!canOpenDelete) return
    if (selectedCount === 0) {
      window.alert('삭제할 퀴즈를 체크해주세요.')
      return
    }
    setIsDeleteModalOpen(true)
  }

  const handleCancelDelete = () => {
    if (isDeleting) return
    setIsDeleteModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!selectedMaterial || selectedDeleteItems.length === 0 || isDeleting) return
    setIsDeleting(true)
    try {
      await deleteQuestionsForMaterial(selectedMaterial.value, selectedDeleteItems)
      refreshQuizzes()
      clearSelection()
      window.alert('선택한 퀴즈가 삭제되었습니다.')
      setIsDeleteModalOpen(false)
    } catch {
      window.alert('퀴즈 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfirmNoMaterials = () => {
    setIsNoMaterialsModalOpen(false)
    navigate(ROUTES.professorMaterials)
  }

  const handleCancelNoMaterials = () => {
    setIsNoMaterialsModalOpen(false)
    navigate(ROUTES.professorDashboard)
  }

  const materialSelectDisabled = !selectedCourse
  const materialPlaceholder = selectedCourse ? '교안을 선택하세요' : '먼저 강의를 선택하세요'
  const hasSavedMaterials = countSavedMaterials(materialsDto) > 0

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

        {!isViewerMode ? (
          <div className="edu-quiz-mgmt__toolbar">
            <Button
              type="button"
              variant="primary"
              disabled={!selectedMaterial || isDeleting}
              onClick={handleCreateQuiz}
            >
              퀴즈 생성
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={!canOpenDelete}
              onClick={handleOpenDeleteModal}
            >
              퀴즈 삭제
            </Button>
          </div>
        ) : null}

        {!selectedMaterial ? (
          <p className="edu-quiz-mgmt__hint">
            {hasSavedMaterials
              ? '교안을 선택하면 해당 교안의 퀴즈 목록이 표시됩니다.'
              : '교안 파일 관리에서 교안을 저장한 뒤 이 화면에서 선택할 수 있습니다.'}
          </p>
        ) : null}

        <QuizTable
          quizzes={quizzes}
          selectedQuestionIds={selectedQuestionIds}
          onToggleQuestion={handleToggleQuestion}
          onToggleAll={handleToggleAll}
          onViewQuiz={handleViewQuiz}
          selectionDisabled={isDeleting}
        />
      </div>

      <ConfirmModal
        isOpen={isNoMaterialsModalOpen}
        message={NO_MATERIALS_MESSAGE}
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmNoMaterials}
        onCancel={handleCancelNoMaterials}
        closeOnOverlayClick={false}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        message={DELETE_CONFIRM_MESSAGE}
        confirmText="삭제"
        cancelText="취소"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirmLoading={isDeleting}
        disableConfirm={isDeleting}
        closeOnOverlayClick={!isDeleting}
        closeOnEscape={!isDeleting}
      >
        <p className="edu-quiz-mgmt__delete-warn">삭제된 퀴즈는 복구할 수 없습니다.</p>
      </ConfirmModal>
    </div>
  )
}

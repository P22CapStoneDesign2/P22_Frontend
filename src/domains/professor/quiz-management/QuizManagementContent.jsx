import { useEffect, useMemo, useState } from 'react'
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
  fetchProfessorCourseOptions,
  fetchQuizMgmtMaterialOptionsForCourse,
} from '../../catalog/lessonCatalogService.js'
import {
  deleteQuizQuestionsForSelection,
  fetchLessonQuestionCountForLesson,
  fetchQuizTableRowsForLesson,
} from '../../catalog/quizCatalogService.js'
import { restoreQuizManagementSelection } from './quizManagementRestore.js'
import { useProfessorAccountGate } from '../hooks/useProfessorAccountGate.js'
import ProfessorPendingNotice from '../components/ProfessorPendingNotice.jsx'
import QuizTable from './QuizTable.jsx'
import './QuizManagementPage.css'

const NO_LESSONS_MESSAGE =
  '등록된 교안이 없습니다. 교안 관리 페이지에서 교안을 먼저 등록하시겠습니까?'

const DELETE_CONFIRM_MESSAGE = '선택한 퀴즈를 삭제하시겠습니까?'

const TABLE_IDLE_HINT = '교안을 선택하면 해당 교안의 퀴즈 목록이 표시됩니다.'

export default function QuizManagementContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isViewerMode } = useIsViewerMode()
  const { isProfessorPending, canMutateProfessorContent } = useProfessorAccountGate()

  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)

  const [materials, setMaterials] = useState([])
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  const [quizzes, setQuizzes] = useState([])
  const [quizzesLoading, setQuizzesLoading] = useState(false)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(() => new Set())

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false)
  const [isNoLessonsModalOpen, setIsNoLessonsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const opts = await fetchProfessorCourseOptions()
      if (cancelled) return
      setCourses(opts)
      setCoursesLoading(false)

      if (opts.length === 0) {
        setIsNoLessonsModalOpen(true)
        return
      }

      const restored = await restoreQuizManagementSelection(location.state)
      if (cancelled) return
      if (restored?.selectedCourse) {
        setSelectedCourse(restored.selectedCourse)
        setMaterials(restored.materials ?? [])
        setSelectedMaterial(restored.selectedMaterial ?? null)
        setQuizzes(restored.quizzes ?? [])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [location.state])

  const selectedCount = selectedQuestionIds.size
  const lessonIdForQuiz = selectedMaterial?.value ?? ''
  const canOpenDelete = Boolean(selectedMaterial) && !isDeleting

  const selectedDeleteItems = useMemo(() => {
    return quizzes
      .filter((row) => selectedQuestionIds.has(row.questionId))
      .map((row) => ({ quizSetId: row.quizSetId, questionId: row.questionId }))
  }, [quizzes, selectedQuestionIds])

  const clearSelection = () => {
    setSelectedQuestionIds(new Set())
  }

  const refreshQuizzes = async (lessonId) => {
    const id = String(lessonId ?? '').trim()
    if (!id) {
      setQuizzes([])
      return
    }
    setQuizzesLoading(true)
    const rows = await fetchQuizTableRowsForLesson(id)
    setQuizzes(rows)
    setQuizzesLoading(false)
  }

  const handleCourseSelect = async (option) => {
    setSelectedCourse(option)
    setSelectedMaterial(null)
    setQuizzes([])
    clearSelection()
    setMaterialsLoading(true)
    const opts = await fetchQuizMgmtMaterialOptionsForCourse(option.value)
    setMaterials(opts)
    setMaterialsLoading(false)
  }

  const handleMaterialSelect = async (option) => {
    setSelectedMaterial(option)
    clearSelection()
    await refreshQuizzes(option.value)
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

  const handleCreateQuiz = async () => {
    if (isViewerMode) return
    if (!canMutateProfessorContent) {
      window.alert('관리자 승인 대기 중입니다. 승인 후 퀴즈를 생성할 수 있습니다.')
      return
    }
    if (!selectedMaterial?.value) {
      window.alert('교안을 먼저 선택해주세요.')
      return
    }
    const existingQuestionCount = await fetchLessonQuestionCountForLesson(selectedMaterial.value)
    navigate(professorQuizCreatePath(selectedMaterial.value), {
      state: {
        lessonId: selectedMaterial.value,
        courseId: selectedCourse?.value,
        materialId: selectedMaterial.value,
        displayNumberOffset: existingQuestionCount,
        nextQuestionNumber: existingQuestionCount + 1,
      },
    })
  }

  const handleViewQuiz = (quizSetId, questionId) => {
    navigate(professorQuizEditPath(quizSetId), {
      state: {
        lessonId: lessonIdForQuiz,
        courseId: selectedCourse?.value,
        materialId: selectedMaterial?.value,
        initialActiveQuestionId: questionId,
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
      await deleteQuizQuestionsForSelection(selectedDeleteItems)
      await refreshQuizzes(selectedMaterial.value)
      clearSelection()
      window.alert('선택한 퀴즈가 삭제되었습니다.')
      setIsDeleteModalOpen(false)
    } catch {
      window.alert('퀴즈 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfirmNoLessons = () => {
    setIsNoLessonsModalOpen(false)
    navigate(ROUTES.professorMaterials)
  }

  const handleCancelNoLessons = () => {
    setIsNoLessonsModalOpen(false)
    navigate(ROUTES.professorDashboard)
  }

  const materialSelectDisabled = !selectedCourse || materialsLoading
  const tableEmptyHint = !selectedMaterial
    ? TABLE_IDLE_HINT
    : '등록된 문항이 없습니다.'

  return (
    <div className="edu-quiz-mgmt">
      <div className="edu-quiz-mgmt__card">
        <h1 className="edu-quiz-mgmt__title">교안별 퀴즈 관리</h1>

        {isProfessorPending ? <ProfessorPendingNotice /> : null}

        <div className="edu-quiz-mgmt__filters">
          <div className="edu-quiz-mgmt__field">
            <span className="edu-quiz-mgmt__label" id="quiz-mgmt-course-label">
              강의
            </span>
            <SelectDropdown
              className="edu-quiz-mgmt__select"
              options={courses}
              selected={selectedCourse}
              placeholder={coursesLoading ? '불러오는 중…' : '강의를 선택하세요'}
              isOpen={courseDropdownOpen}
              onOpenChange={setCourseDropdownOpen}
              onSelect={handleCourseSelect}
              disabled={coursesLoading}
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
              placeholder={
                !selectedCourse
                  ? '먼저 강의를 선택하세요'
                  : materialsLoading
                    ? '불러오는 중…'
                    : '교안을 선택하세요'
              }
              isOpen={materialDropdownOpen}
              onOpenChange={setMaterialDropdownOpen}
              onSelect={handleMaterialSelect}
              disabled={materialSelectDisabled}
              emptyMessage="등록된 교안이 없습니다."
            />
          </div>
        </div>

        {selectedMaterial ? (
          <p className="edu-quiz-mgmt__info-bar" role="status">
            선택된 교안: <strong>{selectedMaterial.label}</strong>
          </p>
        ) : (
          <p className="edu-quiz-mgmt__info-bar edu-quiz-mgmt__info-bar--muted" role="status">
            {TABLE_IDLE_HINT}
          </p>
        )}

        <QuizTable
          quizzes={selectedMaterial && !quizzesLoading ? quizzes : []}
          selectedQuestionIds={selectedQuestionIds}
          onToggleQuestion={handleToggleQuestion}
          onToggleAll={handleToggleAll}
          selectionDisabled={isDeleting || !selectedMaterial}
          onViewQuiz={handleViewQuiz}
          emptyHint={tableEmptyHint}
        />

        <div className="edu-quiz-mgmt__actions">
          {!isViewerMode ? (
            <>
              <Button
                type="button"
                variant="primary"
                disabled={!selectedMaterial || !canMutateProfessorContent}
                onClick={handleCreateQuiz}
              >
                퀴즈 생성
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={!canOpenDelete || selectedCount === 0 || !canMutateProfessorContent}
                onClick={handleOpenDeleteModal}
              >
                퀴즈 삭제
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <ConfirmModal
        isOpen={isNoLessonsModalOpen && !coursesLoading && courses.length === 0}
        message={NO_LESSONS_MESSAGE}
        onConfirm={handleConfirmNoLessons}
        onCancel={handleCancelNoLessons}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        message={DELETE_CONFIRM_MESSAGE}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

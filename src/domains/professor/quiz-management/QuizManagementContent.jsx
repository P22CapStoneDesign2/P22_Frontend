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
import { fetchProfessorCourseOptions } from '../../catalog/lessonCatalogService.js'
import {
  deleteQuizSetsForSelection,
  fetchQuizTableRowsForLesson,
} from '../../catalog/quizCatalogService.js'
import { restoreQuizManagementSelection } from './quizManagementRestore.js'
import QuizTable from './QuizTable.jsx'
import './QuizManagementPage.css'

const NO_LESSONS_MESSAGE =
  '등록된 교안이 없습니다. 교안 관리 페이지에서 교안을 먼저 등록하시겠습니까?'

const DELETE_CONFIRM_MESSAGE = '선택한 퀴즈를 삭제하시겠습니까?'

export default function QuizManagementContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isViewerMode } = useIsViewerMode()

  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [quizzesLoading, setQuizzesLoading] = useState(false)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(() => new Set())

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
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
        setQuizzes(restored.quizzes)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [location.state])

  const selectedCount = selectedQuestionIds.size
  const canOpenDelete = Boolean(selectedCourse) && !isDeleting

  const selectedDeleteItems = useMemo(() => {
    return quizzes
      .filter((row) => selectedQuestionIds.has(row.questionId))
      .map((row) => ({ quizSetId: row.quizSetId, questionId: row.questionId }))
  }, [quizzes, selectedQuestionIds])

  const clearSelection = () => {
    setSelectedQuestionIds(new Set())
  }

  const refreshQuizzes = async () => {
    if (!selectedCourse?.value) {
      setQuizzes([])
      return
    }
    setQuizzesLoading(true)
    const rows = await fetchQuizTableRowsForLesson(selectedCourse.value)
    setQuizzes(rows)
    setQuizzesLoading(false)
  }

  const handleCourseSelect = async (option) => {
    setSelectedCourse(option)
    setQuizzes([])
    clearSelection()
    setQuizzesLoading(true)
    const rows = await fetchQuizTableRowsForLesson(option.value)
    setQuizzes(rows)
    setQuizzesLoading(false)
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
    if (isViewerMode || !selectedCourse) return
    navigate(professorQuizCreatePath(selectedCourse.value), {
      state: { lessonId: selectedCourse.value },
    })
  }

  const handleViewQuiz = (quizSetId, questionId) => {
    navigate(professorQuizEditPath(quizSetId), {
      state: {
        lessonId: selectedCourse?.value,
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
    if (!selectedCourse || selectedDeleteItems.length === 0 || isDeleting) return
    setIsDeleting(true)
    try {
      await deleteQuizSetsForSelection(selectedDeleteItems)
      await refreshQuizzes()
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

  return (
    <div className="edu-quiz-mgmt">
      <div className="edu-quiz-mgmt__card">
        <h1 className="edu-quiz-mgmt__title">교안별 퀴즈 관리</h1>

        <div className="edu-quiz-mgmt__filters">
          <div className="edu-quiz-mgmt__field">
            <span className="edu-quiz-mgmt__label" id="quiz-mgmt-course-label">
              교안
            </span>
            <SelectDropdown
              className="edu-quiz-mgmt__select"
              options={courses}
              selected={selectedCourse}
              placeholder={coursesLoading ? '불러오는 중…' : '교안을 선택하세요'}
              isOpen={courseDropdownOpen}
              onOpenChange={setCourseDropdownOpen}
              onSelect={handleCourseSelect}
              disabled={coursesLoading}
              emptyMessage="등록된 강의가 없습니다."
            />
          </div>
        </div>

        <QuizTable
          quizzes={quizzesLoading ? [] : quizzes}
          selectedQuestionIds={selectedQuestionIds}
          onToggleQuestion={handleToggleQuestion}
          onToggleAll={handleToggleAll}
          selectionDisabled={isDeleting}
          onViewQuiz={handleViewQuiz}
        />

        {!quizzesLoading && selectedCourse && quizzes.length === 0 ? (
          <p className="edu-quiz-mgmt__empty" role="status">
            등록된 퀴즈가 없습니다.
          </p>
        ) : null}

        <div className="edu-quiz-mgmt__actions">
          {!isViewerMode ? (
            <>
              <Button
                type="button"
                variant="primary"
                disabled={!selectedCourse}
                onClick={handleCreateQuiz}
              >
                퀴즈 생성
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={!canOpenDelete || selectedCount === 0}
                onClick={handleOpenDeleteModal}
              >
                선택 삭제
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

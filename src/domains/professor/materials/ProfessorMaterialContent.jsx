import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SelectDropdown from '../../../components/ui/SelectDropdown/SelectDropdown.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import PageBackButton from '../../../components/ui/PageBackButton/PageBackButton.jsx'
import { useToast } from '../../../components/ui/Toast/useToast.js'
import { TOAST_MESSAGES } from '../../../shared/feedback/toastMessages.js'
import {
  PROFESSOR_MATERIALS_COURSE_QUERY_KEY,
  ROUTES,
  professorMaterialViewerPath,
} from '../../../shared/constants/routes.js'
import {
  createLesson,
  createLessonMaterial,
  deleteLesson,
  deleteLessonMaterial,
  updateLesson,
  updateLessonMaterial,
} from '../../../api/lessons.js'
import { apiResponseData } from '../../../api/apiResponse.js'
import {
  fetchLessonMaterialsForLesson,
  fetchMaterialDetail,
  fetchProfessorLessonsList,
} from '../../catalog/lessonCatalogService.js'
import { readPdfUrlFromLesson } from '../../../shared/utils/pdfMeta.js'
import MaterialFileTable from './MaterialFileTable.jsx'
import {
  DEFAULT_MATERIAL_TITLE,
  mapCourseDropdownOptions,
  mapLessonsToCourseIdList,
  mapMaterialsToTableRows,
} from './materialsViewMapper.js'
import { useProfessorAccountGate } from '../hooks/useProfessorAccountGate.js'
import ProfessorPendingNotice from '../components/ProfessorPendingNotice.jsx'
import { formatMaterialUploadDate } from './materialUtils.js'
import './ProfessorMaterialPage.css'

const DELETE_MATERIAL_CONFIRM_MESSAGE =
  '교안 파일을 삭제하면 관련된 퀴즈들도 모두 삭제됩니다. 정말 삭제하시겠습니까?'

const DELETE_COURSE_CONFIRM_MESSAGE =
  '강의를 삭제하면 해당 강의의 교안과 퀴즈도 함께 삭제될 수 있습니다. 정말 삭제하시겠습니까?'

const SAVE_CONFIRM_MESSAGE = '저장하시겠습니까?'

const PDF_UPLOAD_ALERT = 'PDF 업로드 API가 아직 연결되지 않았습니다.'
const MATERIAL_LESSON_MISMATCH_MESSAGE = '선택된 강의와 교안 정보가 일치하지 않습니다.'

export default function ProfessorMaterialContent() {
  const { isProfessorPending, canMutateProfessorContent } = useProfessorAccountGate()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [courseList, setCourseList] = useState([])
  /** 강의명 — GET /api/lessons 의 lesson.title 만 */
  const [lessonTitleById, setLessonTitleById] = useState({})
  const [lessonsLoading, setLessonsLoading] = useState(true)

  const [selectedLessonId, setSelectedLessonId] = useState(null)
  /** 교안 목록 — GET /api/lessons/{lessonId}/materials */
  const [materials, setMaterials] = useState([])
  /** 현재 materials가 속한 lessonId (선택 강의와 일치할 때만 테이블에 표시) */
  const [materialsLessonId, setMaterialsLessonId] = useState(null)
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const selectedLessonIdRef = useRef(null)

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')

  const [isCreateMaterialModalOpen, setIsCreateMaterialModalOpen] = useState(false)
  const [newMaterialTitle, setNewMaterialTitle] = useState('')
  const [isCreatingMaterial, setIsCreatingMaterial] = useState(false)

  const [editMaterialId, setEditMaterialId] = useState(null)
  const [editingMaterialTitle, setEditingMaterialTitle] = useState('')
  const [isEditMaterialModalOpen, setIsEditMaterialModalOpen] = useState(false)
  const [isUpdatingMaterialTitle, setIsUpdatingMaterialTitle] = useState(false)

  const [isRenameCourseModalOpen, setIsRenameCourseModalOpen] = useState(false)
  const [editingCourseName, setEditingCourseName] = useState('')
  const [isUpdatingCourseName, setIsUpdatingCourseName] = useState(false)

  const [deleteTargetMaterialId, setDeleteTargetMaterialId] = useState(null)
  const [isDeleteMaterialModalOpen, setIsDeleteMaterialModalOpen] = useState(false)
  const [isDeletingMaterial, setIsDeletingMaterial] = useState(false)

  const [deleteTargetLessonId, setDeleteTargetLessonId] = useState(null)
  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false)
  const [isDeletingCourse, setIsDeletingCourse] = useState(false)

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

  const lessonIdFromUrl = searchParams.get(PROFESSOR_MATERIALS_COURSE_QUERY_KEY) ?? ''

  const selectedLessonTitle = selectedLessonId
    ? (lessonTitleById[selectedLessonId] ?? '').trim() || '—'
    : ''

  selectedLessonIdRef.current = selectedLessonId

  const resetMaterialUiState = useCallback(() => {
    setMaterials([])
    setMaterialsLessonId(null)
    setEditMaterialId(null)
    setEditingMaterialTitle('')
    setIsEditMaterialModalOpen(false)
    setDeleteTargetMaterialId(null)
    setIsDeleteMaterialModalOpen(false)
    setIsCreateMaterialModalOpen(false)
    setNewMaterialTitle('')
  }, [])

  const applyLessonsList = useCallback((list) => {
    setCourseList(mapLessonsToCourseIdList(list))
    const nextLessonTitles = {}
    list.forEach((l) => {
      nextLessonTitles[l.id] = l.title
    })
    setLessonTitleById(nextLessonTitles)
  }, [])

  const reloadLessons = useCallback(async () => {
    const list = await fetchProfessorLessonsList()
    applyLessonsList(list)
    return list
  }, [applyLessonsList])

  const loadMaterialsForLesson = useCallback(async (lessonId) => {
    const id = String(lessonId ?? '').trim()
    if (!id) {
      setMaterials([])
      setMaterialsLessonId(null)
      setMaterialsLoading(false)
      return []
    }

    setMaterials([])
    setMaterialsLessonId(null)
    setMaterialsLoading(true)

    try {
      const list = await fetchLessonMaterialsForLesson(id)
      if (selectedLessonIdRef.current !== id) {
        return []
      }
      setMaterials(list)
      setMaterialsLessonId(id)
      return list
    } catch {
      if (selectedLessonIdRef.current === id) {
        setMaterials([])
        setMaterialsLessonId(id)
      }
      return []
    } finally {
      if (selectedLessonIdRef.current === id) {
        setMaterialsLoading(false)
      }
    }
  }, [])

  const reloadMaterialsForSelectedLesson = useCallback(async () => {
    const id = selectedLessonIdRef.current
    if (!id) {
      resetMaterialUiState()
      return []
    }
    return loadMaterialsForLesson(id)
  }, [loadMaterialsForLesson, resetMaterialUiState])

  const findMaterialInActiveLesson = useCallback(
    (materialId) => {
      if (!materialId || !selectedLessonId || materialsLessonId !== selectedLessonId) {
        return null
      }
      return materials.find((m) => m.materialId === materialId) ?? null
    },
    [materials, materialsLessonId, selectedLessonId],
  )

  const assertMaterialMatchesSelectedLesson = useCallback(
    (material) => {
      if (!material || !selectedLessonId) return false
      return String(material.lessonId) === String(selectedLessonId)
    },
    [selectedLessonId],
  )

  const handleMaterialLessonMismatch = useCallback(async () => {
    window.alert(MATERIAL_LESSON_MISMATCH_MESSAGE)
    resetMaterialUiState()
    if (selectedLessonIdRef.current) {
      await loadMaterialsForLesson(selectedLessonIdRef.current)
    }
  }, [loadMaterialsForLesson, resetMaterialUiState])

  useEffect(() => {
    let cancelled = false
    reloadLessons().then(() => {
      if (!cancelled) setLessonsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [reloadLessons])

  useEffect(() => {
    if (!lessonIdFromUrl) {
      setSelectedLessonId(null)
      resetMaterialUiState()
      return
    }
    if (courseList.length === 0) return
    const exists = courseList.some((c) => c.id === lessonIdFromUrl)
    setSelectedLessonId(exists ? lessonIdFromUrl : null)
  }, [lessonIdFromUrl, courseList, resetMaterialUiState])

  useEffect(() => {
    if (!selectedLessonId) {
      resetMaterialUiState()
      setMaterialsLoading(false)
      return
    }
    resetMaterialUiState()
    loadMaterialsForLesson(selectedLessonId)
  }, [selectedLessonId, loadMaterialsForLesson, resetMaterialUiState])

  const courseOptions = useMemo(() => {
    const lessons = courseList.map((c) => ({
      id: c.id,
      title: lessonTitleById[c.id] ?? '',
    }))
    return mapCourseDropdownOptions(lessons)
  }, [courseList, lessonTitleById])

  const courseSelectValue = selectedLessonId
    ? {
        value: selectedLessonId,
        label: selectedLessonTitle,
      }
    : null

  const materialRows = useMemo(() => {
    if (
      !selectedLessonId ||
      materialsLoading ||
      materialsLessonId !== selectedLessonId
    ) {
      return []
    }
    return mapMaterialsToTableRows(materials, formatMaterialUploadDate)
  }, [materials, materialsLessonId, materialsLoading, selectedLessonId])

  const handleOpenCreateCourseModal = () => {
    if (!canMutateProfessorContent) {
      window.alert('관리자 승인 대기 중입니다. 승인 후 강의를 추가할 수 있습니다.')
      return
    }
    setNewCourseName('')
    setIsCreateCourseModalOpen(true)
  }

  const handleCourseSelect = (option) => {
    resetMaterialUiState()
    setSelectedLessonId(option.value)
    const next = new URLSearchParams(searchParams)
    next.set(PROFESSOR_MATERIALS_COURSE_QUERY_KEY, option.value)
    setSearchParams(next, { replace: true })
  }

  const handleOpenRenameCourseModal = () => {
    if (!selectedLessonId) return
    setEditingCourseName(selectedLessonTitle === '—' ? '' : selectedLessonTitle)
    setIsRenameCourseModalOpen(true)
  }

  const handleConfirmRenameCourse = async () => {
    if (!selectedLessonId || isUpdatingCourseName) return
    const title = editingCourseName.trim()
    if (!title) {
      window.alert('강의명을 입력해주세요.')
      return
    }
    setIsUpdatingCourseName(true)
    try {
      await updateLesson(selectedLessonId, { title })
      setLessonTitleById((prev) => ({ ...prev, [selectedLessonId]: title }))
      await reloadLessons()
      setIsRenameCourseModalOpen(false)
      showToast(TOAST_MESSAGES.lessonUpdated)
    } catch {
      window.alert('강의명 수정에 실패했습니다.')
    } finally {
      setIsUpdatingCourseName(false)
    }
  }

  const handleConfirmCreateCourse = async () => {
    const name = newCourseName.trim()
    if (!name) return
    try {
      const res = await createLesson({ title: name })
      const data = apiResponseData(res)
      const id = data?.id
      if (id == null) {
        window.alert('강의 생성에 실패했습니다.')
        return
      }
      const lessonId = String(id)
      await reloadLessons()
      resetMaterialUiState()
      setSelectedLessonId(lessonId)
      const urlParams = new URLSearchParams(searchParams)
      urlParams.set(PROFESSOR_MATERIALS_COURSE_QUERY_KEY, lessonId)
      setSearchParams(urlParams, { replace: true })
      setIsCreateCourseModalOpen(false)
      showToast(TOAST_MESSAGES.lessonCreated)
    } catch {
      window.alert('강의 생성에 실패했습니다.')
    }
  }

  const handleOpenCreateMaterialModal = () => {
    if (!selectedLessonId) return
    if (!canMutateProfessorContent) {
      window.alert('관리자 승인 대기 중입니다. 승인 후 교안을 추가할 수 있습니다.')
      return
    }
    setNewMaterialTitle(DEFAULT_MATERIAL_TITLE)
    setIsCreateMaterialModalOpen(true)
  }

  const handleConfirmCreateMaterial = async () => {
    if (!selectedLessonId || isCreatingMaterial) return
    const title = newMaterialTitle.trim()
    if (!title) {
      window.alert('교안명을 입력해주세요.')
      return
    }
    setIsCreatingMaterial(true)
    try {
      await createLessonMaterial(selectedLessonId, { title })
      await reloadMaterialsForSelectedLesson()
      setIsCreateMaterialModalOpen(false)
      showToast(TOAST_MESSAGES.materialCreated)
      window.alert(PDF_UPLOAD_ALERT)
    } catch {
      window.alert('교안 추가에 실패했습니다.')
    } finally {
      setIsCreatingMaterial(false)
    }
  }

  const handleReplaceFile = (materialId) => {
    const material = findMaterialInActiveLesson(materialId)
    if (!material || !assertMaterialMatchesSelectedLesson(material)) {
      void handleMaterialLessonMismatch()
      return
    }
    setEditMaterialId(materialId)
    setEditingMaterialTitle((material.title ?? '').trim())
    setIsEditMaterialModalOpen(true)
  }

  const handleConfirmEditMaterialTitle = async () => {
    const materialId = editMaterialId
    if (!selectedLessonId || !materialId || isUpdatingMaterialTitle) return
    const title = editingMaterialTitle.trim()
    if (!title) {
      window.alert('교안명을 입력해주세요.')
      return
    }
    const material = findMaterialInActiveLesson(materialId)
    if (!material || !assertMaterialMatchesSelectedLesson(material)) {
      setIsEditMaterialModalOpen(false)
      setEditMaterialId(null)
      await handleMaterialLessonMismatch()
      return
    }
    const description =
      typeof material.description === 'string' && material.description.trim()
        ? material.description.trim()
        : undefined
    setIsUpdatingMaterialTitle(true)
    try {
      await updateLessonMaterial(material.lessonId, materialId, { title, description })
      await reloadMaterialsForSelectedLesson()
      setIsEditMaterialModalOpen(false)
      setEditMaterialId(null)
      showToast(TOAST_MESSAGES.materialUpdated)
    } catch {
      window.alert('교안명 수정에 실패했습니다.')
    } finally {
      setIsUpdatingMaterialTitle(false)
    }
  }

  const handleDeleteFile = (materialId) => {
    setDeleteTargetMaterialId(materialId)
    setIsDeleteMaterialModalOpen(true)
  }

  const handleConfirmDeleteMaterial = async () => {
    if (!selectedLessonId || !deleteTargetMaterialId || isDeletingMaterial) return
    const material = findMaterialInActiveLesson(deleteTargetMaterialId)
    if (!material || !assertMaterialMatchesSelectedLesson(material)) {
      setIsDeleteMaterialModalOpen(false)
      setDeleteTargetMaterialId(null)
      await handleMaterialLessonMismatch()
      return
    }
    setIsDeletingMaterial(true)
    try {
      await deleteLessonMaterial(material.lessonId, deleteTargetMaterialId)
      await reloadMaterialsForSelectedLesson()
      setIsDeleteMaterialModalOpen(false)
      setDeleteTargetMaterialId(null)
      showToast(TOAST_MESSAGES.materialDeleted)
    } catch {
      window.alert('교안 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeletingMaterial(false)
    }
  }

  const handleOpenDeleteCourseModal = () => {
    if (!selectedLessonId) return
    if (!canMutateProfessorContent) {
      window.alert('관리자 승인 대기 중입니다. 승인 후 강의를 삭제할 수 있습니다.')
      return
    }
    setDeleteTargetLessonId(selectedLessonId)
    setIsDeleteCourseModalOpen(true)
  }

  const handleConfirmDeleteCourse = async () => {
    const lessonId = deleteTargetLessonId
    if (!lessonId || isDeletingCourse) return
    setIsDeletingCourse(true)
    try {
      await deleteLesson(lessonId)
      await reloadLessons()
      if (selectedLessonId === lessonId) {
        setSelectedLessonId(null)
        resetMaterialUiState()
        const next = new URLSearchParams(searchParams)
        next.delete(PROFESSOR_MATERIALS_COURSE_QUERY_KEY)
        setSearchParams(next, { replace: true })
      }
      setIsDeleteCourseModalOpen(false)
      setDeleteTargetLessonId(null)
      showToast(TOAST_MESSAGES.lessonDeleted)
    } catch {
      window.alert('강의 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeletingCourse(false)
    }
  }

  const handleSaveClick = () => {
    setIsSaveModalOpen(true)
  }

  const handleConfirmSave = () => {
    setIsSaveModalOpen(false)
    navigate(ROUTES.professorDashboard)
  }

  const handleBeforeOpenViewer = async (materialId) => {
    const row = findMaterialInActiveLesson(materialId)
    if (!row || !assertMaterialMatchesSelectedLesson(row)) {
      await handleMaterialLessonMismatch()
      return false
    }
    const material = await fetchMaterialDetail(row.lessonId, materialId)
    if (!material) {
      window.alert('교안을 찾을 수 없습니다.')
      return false
    }
    const pdfUrl = readPdfUrlFromLesson(material)
    if (!pdfUrl) {
      window.alert('PDF URL이 없습니다.')
      return false
    }
    return row.lessonId
  }

  const handleOpenViewer = async (materialId) => {
    const lessonIdForViewer = await handleBeforeOpenViewer(materialId)
    if (!lessonIdForViewer) return
    navigate(professorMaterialViewerPath(materialId, lessonIdForViewer))
  }

  return (
    <div className="edu-mat">
      <div className="edu-mat__card">
        <h1 className="edu-mat__title">교안 관리</h1>
        <PageBackButton fallbackPath={ROUTES.professorDashboard} />

        {isProfessorPending ? <ProfessorPendingNotice /> : null}

        <div className="edu-mat__field">
          <span className="edu-mat__label" id="edu-mat-course-select-label">
            강의 선택
          </span>
          <SelectDropdown
            className="edu-mat__select"
            options={courseOptions}
            selected={courseSelectValue}
            placeholder={lessonsLoading ? '불러오는 중…' : '강의를 선택하세요'}
            isOpen={courseDropdownOpen}
            onOpenChange={setCourseDropdownOpen}
            onSelect={handleCourseSelect}
            disabled={lessonsLoading}
            emptyMessage="등록된 강의가 없습니다."
            footerAction={
              canMutateProfessorContent
                ? {
                    label: '+ 강의 추가하기',
                    onSelect: handleOpenCreateCourseModal,
                  }
                : undefined
            }
          />
        </div>

        {selectedLessonId ? (
          <div className="edu-mat__course-status-block" role="status">
            <div className="edu-mat__course-status-row">
              <p className="edu-mat__course-status">
                선택된 강의: <strong>{selectedLessonTitle}</strong>
              </p>
              <div className="edu-mat__course-actions edu-action-group">
                <Button
                  type="button"
                  variant="secondary"
                  className="edu-mat-rename-course-btn"
                  onClick={handleOpenRenameCourseModal}
                >
                  강의 수정
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="edu-mat-delete-course-btn"
                  disabled={!canMutateProfessorContent || isDeletingCourse}
                  onClick={handleOpenDeleteCourseModal}
                >
                  강의 삭제
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <section className="edu-mat-table-section" aria-label="교안 목록">
          <div className="edu-mat-table-section__head">
            <Button
              type="button"
              variant="primary"
              className="edu-mat-add-file-btn"
              disabled={!selectedLessonId || !canMutateProfessorContent || materialsLoading}
              onClick={handleOpenCreateMaterialModal}
            >
              교안 추가
            </Button>
          </div>
          <MaterialFileTable
            files={selectedLessonId ? materialRows : []}
            courseId={selectedLessonId ?? ''}
            onReplaceFile={handleReplaceFile}
            onDeleteFile={handleDeleteFile}
            onOpenViewer={handleOpenViewer}
            emptyHint={
              materialsLoading
                ? '교안 목록을 불러오는 중…'
                : selectedLessonId
                  ? '등록된 교안이 없습니다.'
                  : '강의를 선택하면 등록된 교안 목록이 표시됩니다.'
            }
          />
        </section>

        <div className="edu-mat__footer-save">
          <Button type="button" variant="primary" className="edu-mat-save-btn" onClick={handleSaveClick}>
            저장
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isCreateCourseModalOpen}
        title="강의 추가"
        confirmText="추가"
        cancelText="취소"
        onConfirm={handleConfirmCreateCourse}
        onCancel={() => setIsCreateCourseModalOpen(false)}
        disableConfirm={!newCourseName.trim()}
      >
        <div className="edu-mat-modal-course">
          <label className="edu-mat__label" htmlFor="edu-mat-new-course-name">
            강의명
          </label>
          <input
            id="edu-mat-new-course-name"
            type="text"
            className="edu-mat-input"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            placeholder="강의 이름을 입력하세요"
            autoComplete="off"
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={isCreateMaterialModalOpen}
        title="교안 추가"
        confirmText="추가"
        cancelText="취소"
        onConfirm={handleConfirmCreateMaterial}
        onCancel={() => {
          if (isCreatingMaterial) return
          setIsCreateMaterialModalOpen(false)
        }}
        disableConfirm={!newMaterialTitle.trim() || isCreatingMaterial}
        isConfirmLoading={isCreatingMaterial}
        closeOnOverlayClick={!isCreatingMaterial}
        closeOnEscape={!isCreatingMaterial}
      >
        <div className="edu-mat-modal-course">
          <label className="edu-mat__label" htmlFor="edu-mat-new-material-title">
            교안명
          </label>
          <input
            id="edu-mat-new-material-title"
            type="text"
            className="edu-mat-input"
            value={newMaterialTitle}
            onChange={(e) => setNewMaterialTitle(e.target.value)}
            placeholder="교안 이름을 입력하세요"
            autoComplete="off"
            disabled={isCreatingMaterial}
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={isRenameCourseModalOpen}
        title="강의 수정"
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmRenameCourse}
        onCancel={() => {
          if (isUpdatingCourseName) return
          setIsRenameCourseModalOpen(false)
        }}
        disableConfirm={!editingCourseName.trim() || isUpdatingCourseName}
        isConfirmLoading={isUpdatingCourseName}
        closeOnOverlayClick={!isUpdatingCourseName}
        closeOnEscape={!isUpdatingCourseName}
      >
        <div className="edu-mat-modal-course">
          <label className="edu-mat__label" htmlFor="edu-mat-rename-course-name">
            강의명
          </label>
          <input
            id="edu-mat-rename-course-name"
            type="text"
            className="edu-mat-input"
            value={editingCourseName}
            onChange={(e) => setEditingCourseName(e.target.value)}
            placeholder="강의 이름을 입력하세요"
            autoComplete="off"
            disabled={isUpdatingCourseName}
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={isEditMaterialModalOpen}
        title="교안 수정"
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmEditMaterialTitle}
        onCancel={() => {
          if (isUpdatingMaterialTitle) return
          setIsEditMaterialModalOpen(false)
        }}
        disableConfirm={!editingMaterialTitle.trim() || isUpdatingMaterialTitle}
        isConfirmLoading={isUpdatingMaterialTitle}
        closeOnOverlayClick={!isUpdatingMaterialTitle}
        closeOnEscape={!isUpdatingMaterialTitle}
      >
        <div className="edu-mat-modal-course">
          <label className="edu-mat__label" htmlFor="edu-mat-edit-file-name">
            교안 파일명
          </label>
          <input
            id="edu-mat-edit-file-name"
            type="text"
            className="edu-mat-input"
            value={editingMaterialTitle}
            onChange={(e) => setEditingMaterialTitle(e.target.value)}
            autoComplete="off"
            disabled={isUpdatingMaterialTitle}
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={isDeleteMaterialModalOpen}
        message={DELETE_MATERIAL_CONFIRM_MESSAGE}
        confirmText="삭제"
        cancelText="취소"
        confirmVariant="danger"
        onConfirm={handleConfirmDeleteMaterial}
        onCancel={() => {
          if (isDeletingMaterial) return
          setIsDeleteMaterialModalOpen(false)
        }}
        disableConfirm={isDeletingMaterial}
        isConfirmLoading={isDeletingMaterial}
      />

      <ConfirmModal
        isOpen={isDeleteCourseModalOpen}
        message={DELETE_COURSE_CONFIRM_MESSAGE}
        confirmText="삭제"
        cancelText="취소"
        confirmVariant="danger"
        onConfirm={handleConfirmDeleteCourse}
        onCancel={() => {
          if (isDeletingCourse) return
          setIsDeleteCourseModalOpen(false)
        }}
        disableConfirm={isDeletingCourse}
        isConfirmLoading={isDeletingCourse}
      />

      <ConfirmModal
        isOpen={isSaveModalOpen}
        message={SAVE_CONFIRM_MESSAGE}
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmSave}
        onCancel={() => setIsSaveModalOpen(false)}
      />
    </div>
  )
}

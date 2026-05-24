import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SelectDropdown from '../../../components/ui/SelectDropdown/SelectDropdown.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import {
  PROFESSOR_MATERIALS_COURSE_QUERY_KEY,
  ROUTES,
  professorMaterialViewerPath,
} from '../../../shared/constants/routes.js'
import { createLesson, deleteLesson, updateLesson } from '../../../api/lessons.js'
import { apiResponseData } from '../../../api/apiResponse.js'
import { fetchLessonDetail, fetchProfessorLessonsList } from '../../catalog/lessonCatalogService.js'
import { readPdfUrlFromLesson } from '../../../shared/utils/pdfMeta.js'
import MaterialFileTable from './MaterialFileTable.jsx'
import { formatMaterialUploadDate } from './materialUtils.js'
import './ProfessorMaterialPage.css'

const DELETE_CONFIRM_MESSAGE =
  '교안 파일을 삭제하면 관련된 퀴즈들도 모두 삭제됩니다. 정말 삭제하시겠습니까?'

const SAVE_CONFIRM_MESSAGE = '저장하시겠습니까?'

const PDF_UPLOAD_ALERT = 'PDF 업로드 API가 아직 연결되지 않았습니다.'

export default function ProfessorMaterialContent() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [courses, setCourses] = useState([])
  const [lessonMetaById, setLessonMetaById] = useState({})
  const [lessonsLoading, setLessonsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  /** @type {Record<string, string>} 강의(lesson)별 제목 임시 수정 */
  const [pendingTitlesByLessonId, setPendingTitlesByLessonId] = useState({})

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')

  const [editTargetId, setEditTargetId] = useState(null)
  const [editTitleDraft, setEditTitleDraft] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [deleteTargetFileId, setDeleteTargetFileId] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const courseIdFromUrl = searchParams.get(PROFESSOR_MATERIALS_COURSE_QUERY_KEY) ?? ''

  const applyLessonsList = useCallback((list) => {
    setCourses(list.map((l) => ({ id: l.id, name: l.title })))
    const meta = {}
    list.forEach((l) => {
      meta[l.id] = { createdAt: l.createdAt, updatedAt: l.updatedAt }
    })
    setLessonMetaById(meta)
  }, [])

  const reloadLessons = useCallback(async () => {
    const list = await fetchProfessorLessonsList()
    applyLessonsList(list)
    return list
  }, [applyLessonsList])

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
    if (!courseIdFromUrl) {
      setSelectedCourse(null)
      return
    }
    if (courses.length === 0) return
    const found = courses.find((c) => c.id === courseIdFromUrl) ?? null
    setSelectedCourse(found)
  }, [courseIdFromUrl, courses])

  const courseOptions = courses.map((c) => ({ value: c.id, label: c.name }))
  const courseSelectValue = selectedCourse
    ? {
        value: selectedCourse.id,
        label: pendingTitlesByLessonId[selectedCourse.id] ?? selectedCourse.name,
      }
    : null

  const currentFiles = useMemo(() => {
    if (!selectedCourse) return []
    const meta = lessonMetaById[selectedCourse.id]
    const title = pendingTitlesByLessonId[selectedCourse.id] ?? selectedCourse.name
    return [
      {
        id: selectedCourse.id,
        fileName: title,
        createdAt: formatMaterialUploadDate(meta?.createdAt),
        updatedAt: formatMaterialUploadDate(meta?.updatedAt),
      },
    ]
  }, [selectedCourse, lessonMetaById, pendingTitlesByLessonId])

  const handleOpenCreateCourseModal = () => {
    setNewCourseName('')
    setIsCreateCourseModalOpen(true)
  }

  const handleCourseSelect = (option) => {
    const found = courses.find((c) => c.id === option.value) ?? null
    setSelectedCourse(found)
    const next = new URLSearchParams(searchParams)
    next.set(PROFESSOR_MATERIALS_COURSE_QUERY_KEY, option.value)
    setSearchParams(next, { replace: true })
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
      const list = await reloadLessons()
      const created = list.find((l) => l.id === String(id))
      const nextCourse = { id: String(id), name: created?.title ?? name }
      setSelectedCourse(nextCourse)
      const urlParams = new URLSearchParams(searchParams)
      urlParams.set(PROFESSOR_MATERIALS_COURSE_QUERY_KEY, nextCourse.id)
      setSearchParams(urlParams, { replace: true })
      setIsCreateCourseModalOpen(false)
    } catch {
      window.alert('강의 생성에 실패했습니다.')
    }
  }

  const handleAddFileClick = () => {
    window.alert(PDF_UPLOAD_ALERT)
  }

  const handleReplaceFile = (fileId) => {
    const course = courses.find((c) => c.id === fileId)
    const currentTitle = pendingTitlesByLessonId[fileId] ?? course?.name ?? ''
    setEditTargetId(fileId)
    setEditTitleDraft(currentTitle || selectedCourse?.name || '')
    setIsEditModalOpen(true)
  }

  const handleConfirmEditTitle = () => {
    const id = editTargetId
    const title = editTitleDraft.trim()
    if (!id || !title) return
    setPendingTitlesByLessonId((prev) => ({ ...prev, [id]: title }))
    if (selectedCourse?.id === id) {
      setSelectedCourse((prev) => (prev ? { ...prev, name: title } : prev))
    }
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, name: title } : c)))
    setIsEditModalOpen(false)
    setEditTargetId(null)
  }

  const handleDeleteFile = (fileId) => {
    setDeleteTargetFileId(fileId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetFileId) return
    try {
      await deleteLesson(deleteTargetFileId)
      await reloadLessons()
      setPendingTitlesByLessonId((prev) => {
        const next = { ...prev }
        delete next[deleteTargetFileId]
        return next
      })
      if (selectedCourse?.id === deleteTargetFileId) {
        setSelectedCourse(null)
        const next = new URLSearchParams(searchParams)
        next.delete(PROFESSOR_MATERIALS_COURSE_QUERY_KEY)
        setSearchParams(next, { replace: true })
      }
      setIsDeleteModalOpen(false)
      setDeleteTargetFileId(null)
    } catch {
      window.alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleSaveClick = () => {
    if (isSaving) return
    setIsSaveModalOpen(true)
  }

  const handleConfirmSave = async () => {
    if (isSaving) return
    const entries = Object.entries(pendingTitlesByLessonId).filter(
      ([, title]) => typeof title === 'string' && title.trim(),
    )
    setIsSaving(true)
    try {
      for (const [lessonId, title] of entries) {
        await updateLesson(lessonId, { title: title.trim() })
      }
      setPendingTitlesByLessonId({})
      await reloadLessons()
      window.alert('저장되었습니다.')
      setIsSaveModalOpen(false)
      navigate(ROUTES.professorDashboard)
    } catch {
      window.alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBeforeOpenViewer = async (fileId) => {
    const lesson = await fetchLessonDetail(fileId)
    if (!lesson) {
      window.alert('교안을 찾을 수 없습니다.')
      return false
    }
    const pdfUrl = readPdfUrlFromLesson(lesson)
    if (!pdfUrl) {
      window.alert('PDF URL이 없습니다.')
      return false
    }
    return true
  }

  const handleOpenViewer = async (fileId) => {
    const ok = await handleBeforeOpenViewer(fileId)
    if (!ok) return
    navigate(professorMaterialViewerPath(fileId, selectedCourse?.id ?? ''))
  }

  return (
    <div className="edu-mat">
      <div className="edu-mat__card">
        <h1 className="edu-mat__title">교안 관리</h1>

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
            footerAction={{
              label: '+ 강의 추가하기',
              onSelect: handleOpenCreateCourseModal,
            }}
          />
        </div>

        {selectedCourse ? (
          <p className="edu-mat__course-status" role="status">
            선택된 강의: <strong>{courseSelectValue?.label}</strong>
          </p>
        ) : null}

        <section className="edu-mat-table-section" aria-label="교안 목록">
          <div className="edu-mat-table-section__head">
            <Button
              type="button"
              variant="secondary"
              className="edu-mat-add-file-btn"
              disabled={!selectedCourse}
              onClick={handleAddFileClick}
            >
              파일 추가
            </Button>
          </div>
          <MaterialFileTable
            files={selectedCourse ? currentFiles : []}
            courseId={selectedCourse?.id ?? ''}
            onReplaceFile={handleReplaceFile}
            onDeleteFile={handleDeleteFile}
            onOpenViewer={handleOpenViewer}
            emptyHint={
              selectedCourse
                ? '등록된 교안 파일이 없습니다.'
                : '강의를 선택하면 등록된 교안 목록이 표시됩니다.'
            }
          />
        </section>

        <div className="edu-mat__footer-save">
          <Button
            type="button"
            variant="primary"
            className="edu-mat-save-btn"
            onClick={handleSaveClick}
            disabled={isSaving}
          >
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
        isOpen={isEditModalOpen}
        title="교안 수정"
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmEditTitle}
        onCancel={() => setIsEditModalOpen(false)}
        disableConfirm={!editTitleDraft.trim()}
      >
        <div className="edu-mat-modal-course">
          <label className="edu-mat__label" htmlFor="edu-mat-edit-file-name">
            교안 파일명
          </label>
          <input
            id="edu-mat-edit-file-name"
            type="text"
            className="edu-mat-input"
            value={editTitleDraft}
            onChange={(e) => setEditTitleDraft(e.target.value)}
            autoComplete="off"
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        message={DELETE_CONFIRM_MESSAGE}
        confirmText="삭제"
        cancelText="취소"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isSaveModalOpen}
        message={SAVE_CONFIRM_MESSAGE}
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmSave}
        onCancel={() => setIsSaveModalOpen(false)}
        isConfirmLoading={isSaving}
        closeOnOverlayClick={!isSaving}
        closeOnEscape={!isSaving}
      />
    </div>
  )
}

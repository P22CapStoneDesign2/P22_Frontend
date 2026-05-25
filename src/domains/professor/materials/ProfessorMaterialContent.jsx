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
import {
  DEFAULT_LESSON_MATERIAL_TITLE,
  mapCourseDropdownOptions,
  mapLessonsToCourseIdList,
  mapSelectedLessonToMaterialRows,
} from './materialsViewMapper.js'
import {
  readAllCourseDisplayTitles,
  removeCourseDisplayTitle,
  resolveCourseDisplayLabel,
  writeCourseDisplayTitle,
} from './professorCourseDisplayStorage.js'
import { useProfessorAccountGate } from '../hooks/useProfessorAccountGate.js'
import ProfessorPendingNotice from '../components/ProfessorPendingNotice.jsx'
import { formatMaterialUploadDate } from './materialUtils.js'
import './ProfessorMaterialPage.css'

const DELETE_CONFIRM_MESSAGE =
  '교안 파일을 삭제하면 관련된 퀴즈들도 모두 삭제됩니다. 정말 삭제하시겠습니까?'

const SAVE_CONFIRM_MESSAGE = '저장하시겠습니까?'

const PDF_UPLOAD_ALERT = 'PDF 업로드 API가 아직 연결되지 않았습니다.'

export default function ProfessorMaterialContent() {
  const { isProfessorPending, canMutateProfessorContent } = useProfessorAccountGate()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  /** @type {Array<{ id: string }>} 강의(드롭다운) 목록 — lessonId와 1:1 매핑(백엔드 course API 없음) */
  const [courseList, setCourseList] = useState([])
  /** @type {Record<string, string>} 강의 표시명(UI 전용, lesson.title과 독립) */
  const [courseNameById, setCourseNameById] = useState({})
  /** @type {Record<string, string>} 교안(lesson) 제목 */
  const [lessonTitleById, setLessonTitleById] = useState({})
  /** @type {Record<string, { createdAt: string, updatedAt: string, description: string }>} */
  const [lessonMetaById, setLessonMetaById] = useState({})
  const [lessonsLoading, setLessonsLoading] = useState(true)

  const [selectedCourseId, setSelectedCourseId] = useState(null)

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')

  const [editLessonId, setEditLessonId] = useState(null)
  const [editingLessonTitle, setEditingLessonTitle] = useState('')
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false)
  const [isUpdatingLessonTitle, setIsUpdatingLessonTitle] = useState(false)

  const [isRenameCourseModalOpen, setIsRenameCourseModalOpen] = useState(false)
  const [editingCourseName, setEditingCourseName] = useState('')

  const [deleteTargetLessonId, setDeleteTargetLessonId] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

  const courseIdFromUrl = searchParams.get(PROFESSOR_MATERIALS_COURSE_QUERY_KEY) ?? ''

  const selectedCourseName = selectedCourseId
    ? (courseNameById[selectedCourseId] ?? '').trim() || '—'
    : ''

  /** 선택 강의에 연결된 교안(현재 1:1 — lessonId = courseId) */
  const selectedLessonId = selectedCourseId

  const applyLessonsList = useCallback((list) => {
    setCourseList(mapLessonsToCourseIdList(list))
    const meta = {}
    const nextLessonTitles = {}
    list.forEach((l) => {
      meta[l.id] = {
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
        description: l.description ?? '',
      }
      nextLessonTitles[l.id] = l.title
    })
    setLessonMetaById(meta)
    setLessonTitleById(nextLessonTitles)
    const stored = readAllCourseDisplayTitles()
    /** @type {Record<string, string>} */
    const nextCourseNames = {}
    list.forEach((l) => {
      nextCourseNames[l.id] = resolveCourseDisplayLabel(l.id, l.title)
    })
    setCourseNameById({ ...stored, ...nextCourseNames })
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
      setSelectedCourseId(null)
      return
    }
    if (courseList.length === 0) return
    const exists = courseList.some((c) => c.id === courseIdFromUrl)
    setSelectedCourseId(exists ? courseIdFromUrl : null)
  }, [courseIdFromUrl, courseList])

  const courseOptions = useMemo(() => {
    const lessons = courseList.map((c) => ({
      id: c.id,
      title: courseNameById[c.id] ?? '',
    }))
    return mapCourseDropdownOptions(lessons, courseNameById)
  }, [courseList, courseNameById])

  const courseSelectValue = selectedCourseId
    ? {
        value: selectedCourseId,
        label: selectedCourseName,
      }
    : null

  const lessonRows = useMemo(
    () =>
      mapSelectedLessonToMaterialRows(
        selectedLessonId,
        lessonTitleById,
        lessonMetaById,
        formatMaterialUploadDate,
      ),
    [selectedLessonId, lessonMetaById, lessonTitleById],
  )

  const handleOpenCreateCourseModal = () => {
    if (!canMutateProfessorContent) {
      window.alert('관리자 승인 대기 중입니다. 승인 후 강의를 추가할 수 있습니다.')
      return
    }
    setNewCourseName('')
    setIsCreateCourseModalOpen(true)
  }

  const handleCourseSelect = (option) => {
    setSelectedCourseId(option.value)
    const next = new URLSearchParams(searchParams)
    next.set(PROFESSOR_MATERIALS_COURSE_QUERY_KEY, option.value)
    setSearchParams(next, { replace: true })
  }

  const handleOpenRenameCourseModal = () => {
    if (!selectedCourseId) return
    setEditingCourseName(selectedCourseName === '—' ? '' : selectedCourseName)
    setIsRenameCourseModalOpen(true)
  }

  const handleConfirmRenameCourse = () => {
    if (!selectedCourseId) return
    const name = editingCourseName.trim()
    if (!name) {
      window.alert('강의명을 입력해주세요.')
      return
    }
    writeCourseDisplayTitle(selectedCourseId, name)
    setCourseNameById((prev) => ({ ...prev, [selectedCourseId]: name }))
    setIsRenameCourseModalOpen(false)
  }

  const handleConfirmCreateCourse = async () => {
    const name = newCourseName.trim()
    if (!name) return
    try {
      const res = await createLesson({ title: DEFAULT_LESSON_MATERIAL_TITLE })
      const data = apiResponseData(res)
      const id = data?.id
      if (id == null) {
        window.alert('강의 생성에 실패했습니다.')
        return
      }
      const lessonId = String(id)
      writeCourseDisplayTitle(lessonId, name)
      const list = await reloadLessons()
      const created = list.find((l) => l.id === lessonId)
      const lessonTitle = created?.title ?? DEFAULT_LESSON_MATERIAL_TITLE
      setCourseNameById((prev) => ({ ...prev, [lessonId]: name }))
      setLessonTitleById((prev) => ({ ...prev, [lessonId]: lessonTitle }))
      setSelectedCourseId(lessonId)
      const urlParams = new URLSearchParams(searchParams)
      urlParams.set(PROFESSOR_MATERIALS_COURSE_QUERY_KEY, lessonId)
      setSearchParams(urlParams, { replace: true })
      setIsCreateCourseModalOpen(false)
    } catch {
      window.alert('강의 생성에 실패했습니다.')
    }
  }

  const handleAddFileClick = () => {
    window.alert(PDF_UPLOAD_ALERT)
  }

  const handleReplaceFile = (lessonId) => {
    const currentTitle = (lessonTitleById[lessonId] ?? '').trim()
    setEditLessonId(lessonId)
    setEditingLessonTitle(currentTitle)
    setIsEditLessonModalOpen(true)
  }

  const handleConfirmEditLessonTitle = async () => {
    const lessonId = editLessonId
    if (!lessonId || isUpdatingLessonTitle) return
    const title = editingLessonTitle.trim()
    if (!title) {
      window.alert('교안명을 입력해주세요.')
      return
    }
    const meta = lessonMetaById[lessonId]
    const description =
      typeof meta?.description === 'string' && meta.description.trim()
        ? meta.description.trim()
        : undefined
    setIsUpdatingLessonTitle(true)
    try {
      await updateLesson(lessonId, { title, description })
      setLessonTitleById((prev) => ({ ...prev, [lessonId]: title }))
      await reloadLessons()
      setIsEditLessonModalOpen(false)
      setEditLessonId(null)
    } catch {
      window.alert('교안명 수정에 실패했습니다.')
    } finally {
      setIsUpdatingLessonTitle(false)
    }
  }

  const handleDeleteFile = (lessonId) => {
    setDeleteTargetLessonId(lessonId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetLessonId) return
    try {
      await deleteLesson(deleteTargetLessonId)
      await reloadLessons()
      removeCourseDisplayTitle(deleteTargetLessonId)
      setCourseNameById((prev) => {
        const next = { ...prev }
        delete next[deleteTargetLessonId]
        return next
      })
      setLessonTitleById((prev) => {
        const next = { ...prev }
        delete next[deleteTargetLessonId]
        return next
      })
      if (selectedCourseId === deleteTargetLessonId) {
        setSelectedCourseId(null)
        const next = new URLSearchParams(searchParams)
        next.delete(PROFESSOR_MATERIALS_COURSE_QUERY_KEY)
        setSearchParams(next, { replace: true })
      }
      setIsDeleteModalOpen(false)
      setDeleteTargetLessonId(null)
    } catch {
      window.alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleSaveClick = () => {
    setIsSaveModalOpen(true)
  }

  const handleConfirmSave = () => {
    setIsSaveModalOpen(false)
    navigate(ROUTES.professorDashboard)
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
    navigate(professorMaterialViewerPath(fileId, selectedCourseId ?? ''))
  }

  return (
    <div className="edu-mat">
      <div className="edu-mat__card">
        <h1 className="edu-mat__title">교안 관리</h1>

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

        {selectedCourseId ? (
          <div className="edu-mat__course-status-block" role="status">
            <div className="edu-mat__course-status-row">
              <p className="edu-mat__course-status">
                선택된 강의: <strong>{selectedCourseName}</strong>
              </p>
              <Button
                type="button"
                variant="secondary"
                className="edu-mat-rename-course-btn"
                onClick={handleOpenRenameCourseModal}
              >
                강의명 수정
              </Button>
            </div>
          </div>
        ) : null}

        <section className="edu-mat-table-section" aria-label="교안 목록">
          <div className="edu-mat-table-section__head">
            <Button
              type="button"
              variant="secondary"
              className="edu-mat-add-file-btn"
              disabled={!selectedCourseId || !canMutateProfessorContent}
              onClick={handleAddFileClick}
            >
              파일 추가
            </Button>
          </div>
          <MaterialFileTable
            files={selectedCourseId ? lessonRows : []}
            courseId={selectedCourseId ?? ''}
            onReplaceFile={handleReplaceFile}
            onDeleteFile={handleDeleteFile}
            onOpenViewer={handleOpenViewer}
            emptyHint={
              selectedCourseId
                ? '등록된 교안 파일이 없습니다.'
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
        isOpen={isRenameCourseModalOpen}
        title="강의명 수정"
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmRenameCourse}
        onCancel={() => setIsRenameCourseModalOpen(false)}
        disableConfirm={!editingCourseName.trim()}
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
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={isEditLessonModalOpen}
        title="교안 수정"
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmEditLessonTitle}
        onCancel={() => {
          if (isUpdatingLessonTitle) return
          setIsEditLessonModalOpen(false)
        }}
        disableConfirm={!editingLessonTitle.trim() || isUpdatingLessonTitle}
        isConfirmLoading={isUpdatingLessonTitle}
        closeOnOverlayClick={!isUpdatingLessonTitle}
        closeOnEscape={!isUpdatingLessonTitle}
      >
        <div className="edu-mat-modal-course">
          <label className="edu-mat__label" htmlFor="edu-mat-edit-file-name">
            교안 파일명
          </label>
          <input
            id="edu-mat-edit-file-name"
            type="text"
            className="edu-mat-input"
            value={editingLessonTitle}
            onChange={(e) => setEditingLessonTitle(e.target.value)}
            autoComplete="off"
            disabled={isUpdatingLessonTitle}
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
      />
    </div>
  )
}

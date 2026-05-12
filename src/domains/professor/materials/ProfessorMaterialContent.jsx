import { useRef, useState } from 'react'
import SelectDropdown from '../../../components/ui/SelectDropdown/SelectDropdown.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import MaterialFileTable from './MaterialFileTable.jsx'
import {
  buildMaterialsSaveDto,
  genCourseId,
  genMaterialFileId,
  isPdfFile,
  nowDateString,
} from './materialUtils.js'
import './ProfessorMaterialPage.css'

const DELETE_CONFIRM_MESSAGE =
  '교안 파일을 삭제하면 관련된 퀴즈들도 모두 삭제됩니다. 정말 삭제하시겠습니까?'

export default function ProfessorMaterialContent() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [materialFilesByCourseId, setMaterialFilesByCourseId] = useState({})
  const [deleteTargetFileId, setDeleteTargetFileId] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)

  const addFileInputRef = useRef(null)
  const replaceFileInputRef = useRef(null)
  const replaceTargetFileIdRef = useRef(null)

  const courseOptions = courses.map((c) => ({ value: c.id, label: c.name }))
  const courseSelectValue = selectedCourse
    ? { value: selectedCourse.id, label: selectedCourse.name }
    : null

  const currentFiles = selectedCourse ? materialFilesByCourseId[selectedCourse.id] ?? [] : []

  const handleOpenCreateCourseModal = () => {
    setIsCreateCourseModalOpen(true)
  }

  const handleCourseSelect = (option) => {
    const found = courses.find((c) => c.id === option.value)
    setSelectedCourse(found ?? null)
  }

  const handleConfirmCreateCourse = () => {
    const name = newCourseName.trim()
    if (!name) return
    const id = genCourseId()
    const next = { id, name }
    setCourses((prev) => [...prev, next])
    setSelectedCourse(next)
    setMaterialFilesByCourseId((prev) => ({
      ...prev,
      [id]: [],
    }))
    setNewCourseName('')
    setIsCreateCourseModalOpen(false)
  }

  const handleCancelCreateCourse = () => {
    setNewCourseName('')
    setIsCreateCourseModalOpen(false)
  }

  const handleAddFileClick = () => {
    addFileInputRef.current?.click()
  }

  const handleAddFileChange = (e) => {
    const input = e.target
    const file = input.files?.[0]
    input.value = ''
    if (!file || !selectedCourse) return
    if (!isPdfFile(file)) return
    const ts = nowDateString()
    const entry = {
      id: genMaterialFileId(),
      fileName: file.name,
      file,
      createdAt: ts,
      updatedAt: ts,
    }
    const cid = selectedCourse.id
    setMaterialFilesByCourseId((prev) => ({
      ...prev,
      [cid]: [...(prev[cid] ?? []), entry],
    }))
  }

  const handleReplaceFile = (fileId) => {
    replaceTargetFileIdRef.current = fileId
    replaceFileInputRef.current?.click()
  }

  const handleReplaceFileChange = (e) => {
    const input = e.target
    const file = input.files?.[0]
    input.value = ''
    const targetId = replaceTargetFileIdRef.current
    replaceTargetFileIdRef.current = null
    if (!file || !selectedCourse || !targetId) return
    if (!isPdfFile(file)) return
    const ts = nowDateString()
    const cid = selectedCourse.id
    setMaterialFilesByCourseId((prev) => {
      const list = prev[cid] ?? []
      return {
        ...prev,
        [cid]: list.map((item) =>
          item.id === targetId
            ? { ...item, fileName: file.name, file, updatedAt: ts }
            : item,
        ),
      }
    })
  }

  const handleDeleteFile = (fileId) => {
    setDeleteTargetFileId(fileId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deleteTargetFileId || !selectedCourse) {
      setIsDeleteModalOpen(false)
      setDeleteTargetFileId(null)
      return
    }
    const cid = selectedCourse.id
    setMaterialFilesByCourseId((prev) => ({
      ...prev,
      [cid]: (prev[cid] ?? []).filter((f) => f.id !== deleteTargetFileId),
    }))
    setIsDeleteModalOpen(false)
    setDeleteTargetFileId(null)
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeleteTargetFileId(null)
  }

  const handleSave = () => {
    const dto = buildMaterialsSaveDto(courses, materialFilesByCourseId)
    console.log(dto)
  }

  const fileActionsDisabled = !selectedCourse

  return (
    <div className="edu-mat">
      <div className="edu-mat__card">
        <h1 className="edu-mat__title">교안 파일 관리</h1>

        <div className="edu-mat__field">
          <span className="edu-mat__label" id="edu-mat-course-select-label">
            강의 선택
          </span>
          <SelectDropdown
            className="edu-mat__select"
            options={courseOptions}
            selected={courseSelectValue}
            placeholder="강의를 선택하세요"
            isOpen={courseDropdownOpen}
            onOpenChange={setCourseDropdownOpen}
            onSelect={handleCourseSelect}
            disabled={false}
            emptyMessage="등록된 강의가 없습니다."
            footerAction={{
              label: '+ 강의 추가하기',
              onSelect: handleOpenCreateCourseModal,
            }}
          />
        </div>

        <input
          ref={addFileInputRef}
          type="file"
          className="edu-mat-file-input"
          accept=".pdf,application/pdf"
          onChange={handleAddFileChange}
          aria-hidden
          tabIndex={-1}
        />
        <input
          ref={replaceFileInputRef}
          type="file"
          className="edu-mat-file-input"
          accept=".pdf,application/pdf"
          onChange={handleReplaceFileChange}
          aria-hidden
          tabIndex={-1}
        />

        <section className="edu-mat-table-section" aria-label="교안 파일 목록">
          <div className="edu-mat-table-section__head">
            <Button
              type="button"
              variant="secondary"
              className="edu-mat-add-file-btn"
              onClick={handleAddFileClick}
              disabled={fileActionsDisabled}
            >
              파일 추가
            </Button>
          </div>
          <MaterialFileTable
            files={currentFiles}
            onReplaceFile={handleReplaceFile}
            onDeleteFile={handleDeleteFile}
          />
        </section>

        <div className="edu-mat__footer-save">
          <Button type="button" variant="primary" className="edu-mat-save-btn" onClick={handleSave}>
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
        onCancel={handleCancelCreateCourse}
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
        isOpen={isDeleteModalOpen}
        message={DELETE_CONFIRM_MESSAGE}
        confirmText="삭제"
        cancelText="취소"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

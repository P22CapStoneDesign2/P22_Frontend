import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectDropdown from '../../../components/ui/SelectDropdown/SelectDropdown.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import { countExistingQuestionsForMaterial } from '../../quiz/storage/professorQuizzesStorage.js'
import {
  courseOptionsFromDto,
  loadProfessorMaterialsDto,
  materialOptionsForCourseFromDto,
} from '../../professor/materials/professorMaterialsStorage.js'
import { studentQuizSolvePath } from '../../../shared/constants/routes.js'
import './QuizMaterialSelectPage.css'

/**
 * 퀴즈 풀기 — 강의·교안 선택 (교수 교안·퀴즈 저장소와 동일 소스)
 */
export default function QuizMaterialSelectContent() {
  const navigate = useNavigate()

  const materialsDto = useMemo(() => loadProfessorMaterialsDto(), [])
  const courses = useMemo(() => courseOptionsFromDto(materialsDto), [materialsDto])

  const [materials, setMaterials] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false)

  const questionCount = useMemo(() => {
    if (!selectedMaterial?.value) return 0
    return countExistingQuestionsForMaterial(selectedMaterial.value)
  }, [selectedMaterial])

  const handleCourseSelect = (option) => {
    setSelectedCourse(option)
    setMaterials(materialOptionsForCourseFromDto(materialsDto, option.value))
    setSelectedMaterial(null)
  }

  const handleMaterialSelect = (option) => {
    setSelectedMaterial(option)
  }

  const materialSelectDisabled = !selectedCourse
  const hasMaterialsForCourse = Boolean(selectedCourse && materials.length > 0)
  const showNoQuizHint = Boolean(selectedMaterial && questionCount === 0)
  const canStartQuiz = Boolean(selectedCourse && selectedMaterial && questionCount > 0)

  const handleStartQuiz = () => {
    if (!canStartQuiz || !selectedMaterial) return
    navigate(studentQuizSolvePath(selectedMaterial.value))
  }

  return (
    <div className="edu-stu-quiz-mat">
      <div className="edu-stu-quiz-mat__card">
        <h1 className="edu-stu-quiz-mat__title">퀴즈 풀기</h1>
        <p className="edu-stu-quiz-mat__intro">퀴즈를 풀 강의와 교안을 선택하세요.</p>

        <div className="edu-stu-quiz-mat__filters">
          <div className="edu-stu-quiz-mat__field">
            <span className="edu-stu-quiz-mat__label" id="stu-quiz-mat-course-label">
              강의
            </span>
            <SelectDropdown
              className="edu-stu-quiz-mat__select"
              options={courses}
              selected={selectedCourse}
              placeholder="강의를 선택하세요"
              isOpen={courseDropdownOpen}
              onOpenChange={setCourseDropdownOpen}
              onSelect={handleCourseSelect}
              emptyMessage="등록된 강의가 없습니다."
            />
          </div>

          <div className="edu-stu-quiz-mat__field">
            <span className="edu-stu-quiz-mat__label" id="stu-quiz-mat-material-label">
              교안
            </span>
            <SelectDropdown
              className="edu-stu-quiz-mat__select"
              options={materials}
              selected={selectedMaterial}
              placeholder={
                materialSelectDisabled ? '먼저 강의를 선택하세요' : '교안을 선택하세요'
              }
              isOpen={materialDropdownOpen}
              onOpenChange={setMaterialDropdownOpen}
              onSelect={handleMaterialSelect}
              disabled={materialSelectDisabled}
              emptyMessage="등록된 교안이 없습니다."
            />
          </div>

          {selectedCourse && !hasMaterialsForCourse ? (
            <p className="edu-stu-quiz-mat__hint" role="status">
              등록된 교안이 없습니다.
            </p>
          ) : null}

          {showNoQuizHint ? (
            <p className="edu-stu-quiz-mat__hint" role="status">
              등록된 퀴즈가 없습니다.
            </p>
          ) : null}
        </div>

        <div className="edu-stu-quiz-mat__actions">
          <Button
            type="button"
            variant="primary"
            disabled={!canStartQuiz}
            onClick={handleStartQuiz}
          >
            퀴즈 풀기
          </Button>
        </div>
      </div>
    </div>
  )
}

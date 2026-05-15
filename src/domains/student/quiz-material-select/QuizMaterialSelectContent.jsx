import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectDropdown from '../../../components/ui/SelectDropdown/SelectDropdown.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import { studentQuizSolvePath } from '../../../shared/constants/routes.js'
import './QuizMaterialSelectPage.css'

/** mock: 강의 (SelectDropdown 옵션: value, label) */
const MOCK_COURSES = [
  { value: 'course-ds', label: '자료구조' },
  { value: 'course-algo', label: '알고리즘' },
  { value: 'course-db', label: '데이터베이스' },
]

/**
 * mock: 교안 (강의별 courseId, value는 /student/quiz/:materialId 라우트용 id)
 */
const ALL_MATERIALS = [
  { value: 'mat-ds-w1', label: '자료구조 1주차', courseId: 'course-ds' },
  { value: 'mat-ds-w2', label: '자료구조 2주차', courseId: 'course-ds' },
  { value: 'mat-ds-mid', label: '자료구조 중간고사 범위', courseId: 'course-ds' },
  { value: 'mat-algo-intro', label: '알고리즘 개론', courseId: 'course-algo' },
  { value: 'mat-algo-greedy', label: '탐욕 알고리즘', courseId: 'course-algo' },
  { value: 'mat-algo-dp', label: '동적 계획법', courseId: 'course-algo' },
  { value: 'mat-db-w1', label: 'DB 1주차 — 관계 모델', courseId: 'course-db' },
  { value: 'mat-db-sql', label: 'SQL 기초', courseId: 'course-db' },
]

function materialsForCourse(courseValue) {
  return ALL_MATERIALS.filter((m) => m.courseId === courseValue)
}

/**
 * 퀴즈 풀기 — 강의·교안 선택 본문 (mock 전용, 클라이언트 state만 사용)
 */
export default function QuizMaterialSelectContent() {
  const navigate = useNavigate()

  const [courses] = useState(MOCK_COURSES)
  const [materials, setMaterials] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false)

  const handleCourseSelect = (option) => {
    setSelectedCourse(option)
    setMaterials(materialsForCourse(option.value))
    setSelectedMaterial(null)
  }

  const handleMaterialSelect = (option) => {
    setSelectedMaterial(option)
  }

  const materialSelectDisabled = !selectedCourse || materials.length === 0

  const canStartQuiz = Boolean(selectedCourse && selectedMaterial)

  const handleStartQuiz = () => {
    if (!selectedMaterial) return
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
              emptyMessage="이 강의에 등록된 교안이 없습니다."
            />
          </div>
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

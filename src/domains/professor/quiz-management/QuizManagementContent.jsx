import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectDropdown from '../../../components/ui/SelectDropdown/SelectDropdown.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import QuizTable from './QuizTable.jsx'
import './QuizManagementPage.css'

/** mock: 강의 목록 (SelectDropdown 옵션 형식: value, label) */
const MOCK_COURSES = [
  { value: 'course-ds', label: '자료구조' },
  { value: 'course-algo', label: '알고리즘' },
]

/**
 * mock: 전체 교안 (강의별 필터링용 courseId 포함)
 * value는 교안 ID로, 생성 라우트의 :materialId와 동일하게 사용
 */
const ALL_MATERIALS = [
  { value: 'mat-ds-w1', label: '자료구조 1주차', courseId: 'course-ds' },
  { value: 'mat-ds-w2', label: '자료구조 2주차', courseId: 'course-ds' },
  { value: 'mat-algo-intro', label: '알고리즘 개론', courseId: 'course-algo' },
]

/**
 * mock: 전체 퀴즈 (교안 ID 기준 필터)
 * questionType: multiple → 객관식, short → 단답형
 */
const ALL_QUIZZES = [
  {
    id: 'quiz-1',
    materialId: 'mat-ds-w1',
    question: '스택과 큐의 차이를 설명하시오.',
    questionType: 'short',
    updatedAt: '2026-04-12',
  },
  {
    id: 'quiz-2',
    materialId: 'mat-ds-w1',
    question: '시간 복잡도 O(n log n)인 정렬 알고리즘은?',
    questionType: 'multiple',
    updatedAt: '2026-05-01',
  },
  {
    id: 'quiz-3',
    materialId: 'mat-ds-w2',
    question: '이진 탐색 트리의 최악 시간 복잡도는?',
    questionType: 'multiple',
    updatedAt: '2026-05-03',
  },
]

function materialsForCourse(courseValue) {
  return ALL_MATERIALS.filter((m) => m.courseId === courseValue)
}

function quizzesForMaterial(materialValue) {
  return ALL_QUIZZES.filter((q) => q.materialId === materialValue)
}

/**
 * 교안별 퀴즈 관리 본문: 강의/교안 선택, 퀴즈 목록, 생성·편집 이동
 * 상태는 mock 단계에서 useState만 사용
 */
export default function QuizManagementContent() {
  const navigate = useNavigate()

  /** 강의 목록 (mock: 이후 API로 교체) */
  const [courses] = useState(MOCK_COURSES)

  const [selectedCourse, setSelectedCourse] = useState(null)

  const [materials, setMaterials] = useState([])

  const [selectedMaterial, setSelectedMaterial] = useState(null)

  const [quizzes, setQuizzes] = useState([])

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false)

  /** 강의 선택: 교안 목록 갱신, 교안/퀴즈 선택 초기화 */
  const handleCourseSelect = (option) => {
    setSelectedCourse(option)
    setMaterials(materialsForCourse(option.value))
    setSelectedMaterial(null)
    setQuizzes([])
  }

  /** 교안 선택: 해당 교안의 퀴즈만 표시 */
  const handleMaterialSelect = (option) => {
    setSelectedMaterial(option)
    setQuizzes(quizzesForMaterial(option.value))
  }

  /** 퀴즈 생성 화면으로 이동 (선택된 교안 ID 필요) */
  const handleCreateQuiz = () => {
    if (!selectedMaterial) return
    navigate(`/professor/materials/${selectedMaterial.value}/quizzes/create`)
  }

  /** 행의 보기 → 퀴즈 편집 라우트 */
  const handleViewQuiz = (quizId) => {
    navigate(`/professor/quizzes/${quizId}/edit`)
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
        ) : null}

        <QuizTable quizzes={quizzes} onViewQuiz={handleViewQuiz} />
      </div>
    </div>
  )
}

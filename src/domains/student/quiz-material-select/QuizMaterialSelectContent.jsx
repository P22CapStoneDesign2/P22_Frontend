import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectDropdown from '../../../components/ui/SelectDropdown/SelectDropdown.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import { studentQuizSolvePath } from '../../../shared/constants/routes.js'
import { getQuizzes } from '../../quiz/api/quizApi.js'
import { mapQuizListPageDataToTableRows } from '../../quiz/mappers/quizManagementMapper.js'
import './QuizMaterialSelectPage.css'

/** mock: 강의 (SelectDropdown 옵션: value, label) — 강의/교안 API 추가 시 교체 */
const MOCK_COURSES = [
  { value: 'course-ds', label: '자료구조' },
  { value: 'course-algo', label: '알고리즘' },
  { value: 'course-db', label: '데이터베이스' },
]

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

const QUIZ_PAGE_SIZE = 20

/**
 * 학생 — 풀이 진입 화면.
 *
 * 백엔드가 교안↔퀴즈 관계를 가지지 않으므로 강의·교안 선택은 mock 필터로 두고,
 * 교안 선택 시 `getQuizzes`로 전체 퀴즈 목록을 받아와 학생이 직접 풀 퀴즈를 고른다.
 * (교안 단위 필터 API가 생기면 `getQuizzes` 파라미터만 교체)
 */
export default function QuizMaterialSelectContent() {
  const navigate = useNavigate()

  const [courses] = useState(MOCK_COURSES)
  const [materials, setMaterials] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false)

  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleCourseSelect = (option) => {
    setSelectedCourse(option)
    setMaterials(materialsForCourse(option.value))
    setSelectedMaterial(null)
    setQuizzes([])
    setErrorMessage('')
  }

  const handleMaterialSelect = async (option) => {
    setSelectedMaterial(option)
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await getQuizzes({ page: 0, size: QUIZ_PAGE_SIZE })
      setQuizzes(mapQuizListPageDataToTableRows(res.data?.data))
    } catch (e) {
      setQuizzes([])
      setErrorMessage(e?.response?.data?.message || e?.message || '퀴즈 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = (quizId) => {
    if (!quizId) return
    navigate(studentQuizSolvePath(quizId))
  }

  const materialSelectDisabled = !selectedCourse || materials.length === 0

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

        {selectedMaterial ? (
          loading ? (
            <p className="edu-stu-quiz-mat__intro" role="status" aria-live="polite">
              퀴즈 목록을 불러오는 중입니다…
            </p>
          ) : errorMessage ? (
            <p className="edu-stu-quiz-mat__error" role="alert">
              {errorMessage}
            </p>
          ) : quizzes.length === 0 ? (
            <p className="edu-stu-quiz-mat__intro">현재 풀 수 있는 퀴즈가 없습니다.</p>
          ) : (
            <ul className="edu-stu-quiz-mat__quizzes">
              {quizzes.map((quiz) => (
                <li key={quiz.id} className="edu-stu-quiz-mat__quiz-row">
                  <span className="edu-stu-quiz-mat__quiz-title">{quiz.question}</span>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => handleStartQuiz(quiz.id)}
                  >
                    풀기
                  </Button>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>
    </div>
  )
}

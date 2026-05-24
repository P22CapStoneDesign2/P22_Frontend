import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectDropdown from '../../../components/ui/SelectDropdown/SelectDropdown.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import {
  fetchStudentCourseOptions,
} from '../../catalog/lessonCatalogService.js'
import { fetchQuizOptionsForLesson } from '../../catalog/quizCatalogService.js'
import { studentQuizSolvePath } from '../../../shared/constants/routes.js'
import './QuizMaterialSelectPage.css'

/**
 * 퀴즈 풀기 — GET /api/lessons/my + GET /api/quiz?lessonId=
 */
export default function QuizMaterialSelectContent() {
  const navigate = useNavigate()

  const [lessons, setLessons] = useState([])
  const [lessonsLoading, setLessonsLoading] = useState(true)
  const [quizzes, setQuizzes] = useState([])
  const [quizzesLessonId, setQuizzesLessonId] = useState('')
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  const [lessonDropdownOpen, setLessonDropdownOpen] = useState(false)
  const [quizDropdownOpen, setQuizDropdownOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchStudentCourseOptions().then((opts) => {
      if (!cancelled) {
        setLessons(opts)
        setLessonsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleLessonSelect = async (option) => {
    setSelectedLesson(option)
    setSelectedQuiz(null)
    setQuizzes([])
    setQuizzesLessonId('')
    const opts = await fetchQuizOptionsForLesson(option.value)
    setQuizzes(opts)
    setQuizzesLessonId(option.value)
  }

  const handleQuizSelect = (option) => {
    setSelectedQuiz(option)
  }

  const quizzesLoading = Boolean(selectedLesson?.value) && quizzesLessonId !== selectedLesson.value
  const canStartQuiz = Boolean(selectedLesson && selectedQuiz)

  const handleStartQuiz = () => {
    if (!canStartQuiz || !selectedQuiz || !selectedLesson) return
    navigate(studentQuizSolvePath(selectedQuiz.value, selectedLesson.value))
  }

  return (
    <div className="edu-stu-quiz-mat">
      <div className="edu-stu-quiz-mat__card">
        <h1 className="edu-stu-quiz-mat__title">퀴즈 풀기</h1>
        <p className="edu-stu-quiz-mat__intro">교안과 퀴즈를 선택하세요.</p>

        <div className="edu-stu-quiz-mat__filters">
          <div className="edu-stu-quiz-mat__field">
            <span className="edu-stu-quiz-mat__label" id="stu-quiz-mat-lesson-label">
              교안
            </span>
            <SelectDropdown
              className="edu-stu-quiz-mat__select"
              options={lessons}
              selected={selectedLesson}
              placeholder={lessonsLoading ? '불러오는 중…' : '교안을 선택하세요'}
              isOpen={lessonDropdownOpen}
              onOpenChange={setLessonDropdownOpen}
              onSelect={handleLessonSelect}
              disabled={lessonsLoading}
              emptyMessage="등록된 강의가 없습니다."
            />
          </div>

          <div className="edu-stu-quiz-mat__field">
            <span className="edu-stu-quiz-mat__label" id="stu-quiz-mat-quiz-label">
              퀴즈
            </span>
            <SelectDropdown
              className="edu-stu-quiz-mat__select"
              options={quizzes}
              selected={selectedQuiz}
              placeholder={
                !selectedLesson
                  ? '먼저 교안을 선택하세요'
                  : quizzesLoading
                    ? '불러오는 중…'
                    : '퀴즈를 선택하세요'
              }
              isOpen={quizDropdownOpen}
              onOpenChange={setQuizDropdownOpen}
              onSelect={handleQuizSelect}
              disabled={!selectedLesson || quizzesLoading}
              emptyMessage="등록된 퀴즈가 없습니다."
            />
          </div>

          {selectedLesson && !quizzesLoading && quizzes.length === 0 ? (
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

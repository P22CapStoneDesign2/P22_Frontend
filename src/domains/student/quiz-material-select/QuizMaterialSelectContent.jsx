import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectDropdown from '../../../components/ui/SelectDropdown/SelectDropdown.jsx'
import Button from '../../../components/ui/Button/Button.jsx'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import PageBackButton from '../../../components/ui/PageBackButton/PageBackButton.jsx'
import { ROUTES } from '../../../shared/constants/routes.js'
import { fetchStudentCourseOptions } from '../../catalog/lessonCatalogService.js'
import { studentQuizSolvePath } from '../../../shared/constants/routes.js'
import {
  fetchLessonPracticeStatus,
  formatLessonPracticeStatusLabel,
} from '../quiz/studentLessonPracticeStatus.js'
import { tryNavigateToStoredQuizResult } from '../quiz-solve/studentQuizSubmitFlow.js'
import './QuizMaterialSelectPage.css'

const ALREADY_SUBMITTED_REDIRECT_MESSAGE =
  '이미 제출한 퀴즈입니다. 해설 화면으로 이동합니다.'

const STORED_RESULT_UNAVAILABLE_MESSAGE =
  '이미 제출한 퀴즈입니다. 결과 조회 API가 없어 해설을 불러올 수 없습니다.'

/**
 * 퀴즈 풀기 — GET /api/lessons/my + GET /api/quiz?lessonId=
 */
export default function QuizMaterialSelectContent() {
  const navigate = useNavigate()

  const [lessons, setLessons] = useState([])
  const [lessonsLoading, setLessonsLoading] = useState(true)
  const [lessonStatusLoading, setLessonStatusLoading] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [lessonPracticeComplete, setLessonPracticeComplete] = useState(false)
  const [lessonQuizzes, setLessonQuizzes] = useState([])
  const [firstIncompleteQuiz, setFirstIncompleteQuiz] = useState(null)
  const [firstSubmittedQuiz, setFirstSubmittedQuiz] = useState(null)
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  const [lessonDropdownOpen, setLessonDropdownOpen] = useState(false)
  const [quizDropdownOpen, setQuizDropdownOpen] = useState(false)
  const [submittedRedirectOpen, setSubmittedRedirectOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const opts = await fetchStudentCourseOptions()
      if (cancelled) return
      const enriched = await Promise.all(
        opts.map(async (lesson) => {
          const status = await fetchLessonPracticeStatus(lesson.value)
          return {
            ...lesson,
            practiceComplete: status.practiceComplete,
          }
        }),
      )
      if (!cancelled) {
        setLessons(enriched)
        setLessonsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLessonSelect = async (option) => {
    setSelectedLesson(option)
    setSelectedQuiz(null)
    setLessonQuizzes([])
    setFirstIncompleteQuiz(null)
    setFirstSubmittedQuiz(null)
    setLessonPracticeComplete(false)
    setLessonStatusLoading(true)

    const status = await fetchLessonPracticeStatus(option.value)
    setLessonQuizzes(status.quizzes)
    setLessonPracticeComplete(status.practiceComplete)
    setFirstIncompleteQuiz(status.firstIncompleteQuiz)
    setFirstSubmittedQuiz(status.firstSubmittedQuiz)
    setSelectedQuiz(status.firstIncompleteQuiz ?? status.quizzes[0] ?? null)
    setLessonStatusLoading(false)
  }

  const handleQuizSelect = (option) => {
    setSelectedQuiz(option)
  }

  const handleConfirmSubmittedRedirect = useCallback(() => {
    const quizId = firstSubmittedQuiz?.value ?? selectedQuiz?.value
    if (!quizId) {
      window.alert(STORED_RESULT_UNAVAILABLE_MESSAGE)
      setSubmittedRedirectOpen(false)
      return
    }
    if (!tryNavigateToStoredQuizResult(quizId, navigate)) {
      window.alert(STORED_RESULT_UNAVAILABLE_MESSAGE)
    }
    setSubmittedRedirectOpen(false)
  }, [firstSubmittedQuiz, navigate, selectedQuiz])

  const handleStartQuiz = () => {
    if (!selectedLesson) return
    if (lessonPracticeComplete) {
      setSubmittedRedirectOpen(true)
      return
    }
    const target =
      selectedQuiz ?? firstIncompleteQuiz ?? (lessonQuizzes.length > 0 ? lessonQuizzes[0] : null)
    if (!target) return
    navigate(studentQuizSolvePath(target.value, selectedLesson.value))
  }

  const canStartQuiz =
    Boolean(selectedLesson) &&
    !lessonStatusLoading &&
    (lessonPracticeComplete || selectedQuiz || firstIncompleteQuiz || lessonQuizzes.length > 0)

  return (
    <div className="edu-stu-quiz-mat">
      <div className="edu-stu-quiz-mat__card">
        <h1 className="edu-stu-quiz-mat__title">퀴즈 풀기</h1>
        <PageBackButton fallbackPath={ROUTES.studentDashboard} />
        <p className="edu-stu-quiz-mat__intro">교안을 선택한 뒤 퀴즈를 풀어 주세요.</p>

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

          {selectedLesson ? (
            <p className="edu-stu-quiz-mat__practice-status" role="status">
              풀이 상태:{' '}
              {lessonStatusLoading ? (
                <span>확인 중…</span>
              ) : (
                <span
                  className={`edu-badge ${
                    lessonPracticeComplete ? 'edu-badge--complete' : 'edu-badge--incomplete'
                  }`}
                >
                  {formatLessonPracticeStatusLabel(lessonPracticeComplete)}
                </span>
              )}
            </p>
          ) : null}

          {!lessonPracticeComplete && selectedLesson ? (
            <div className="edu-stu-quiz-mat__field">
              <span className="edu-stu-quiz-mat__label" id="stu-quiz-mat-quiz-label">
                퀴즈
              </span>
              <SelectDropdown
                className="edu-stu-quiz-mat__select"
                options={lessonQuizzes}
                selected={selectedQuiz}
                placeholder={
                  lessonStatusLoading
                    ? '불러오는 중…'
                    : lessonQuizzes.length === 0
                      ? '등록된 퀴즈가 없습니다'
                      : '퀴즈를 선택하세요'
                }
                isOpen={quizDropdownOpen}
                onOpenChange={setQuizDropdownOpen}
                onSelect={handleQuizSelect}
                disabled={lessonStatusLoading || lessonQuizzes.length === 0}
                emptyMessage="등록된 퀴즈가 없습니다."
              />
            </div>
          ) : null}

          {selectedLesson && !lessonStatusLoading && lessonQuizzes.length === 0 ? (
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
            {lessonPracticeComplete ? '해설 화면으로 이동' : '퀴즈 풀기'}
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={submittedRedirectOpen}
        message={ALREADY_SUBMITTED_REDIRECT_MESSAGE}
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmSubmittedRedirect}
        onCancel={() => setSubmittedRedirectOpen(false)}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />
    </div>
  )
}

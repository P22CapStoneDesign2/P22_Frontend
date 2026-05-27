import { fetchQuizOptionsForLesson } from '../../catalog/quizCatalogService.js'

/**
 * 교안(lesson) 단위 풀이 완료 — 해당 lesson의 모든 퀴즈가 제출된 경우만 완료
 * @param {string|number} lessonId
 */
export async function fetchLessonPracticeStatus(lessonId) {
  const id = String(lessonId ?? '').trim()
  if (!id) {
    return {
      practiceComplete: false,
      quizzes: [],
      firstIncompleteQuiz: null,
      firstSubmittedQuiz: null,
    }
  }

  const quizzes = await fetchQuizOptionsForLesson(id)
  if (quizzes.length === 0) {
    return {
      practiceComplete: false,
      quizzes: [],
      firstIncompleteQuiz: null,
      firstSubmittedQuiz: null,
    }
  }

  const firstIncompleteQuiz = quizzes.find((q) => !q.submitted) ?? null
  const firstSubmittedQuiz = quizzes.find((q) => q.submitted) ?? null
  const practiceComplete = quizzes.every((q) => q.submitted)

  return {
    practiceComplete,
    quizzes,
    firstIncompleteQuiz,
    firstSubmittedQuiz,
  }
}

/**
 * @param {boolean | undefined} practiceComplete
 */
export function formatLessonPracticeStatusLabel(practiceComplete) {
  return practiceComplete ? '풀이 완료' : '미완료'
}

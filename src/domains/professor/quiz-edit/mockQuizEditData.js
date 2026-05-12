/**
 * 퀴즈 수정 화면용 mock
 * - 교안(material) 단위로 전체 문제 배열을 보관합니다.
 * - 관리 목록 row id(예: quiz-1)와 각 문항의 id가 동일합니다.
 * - getMockQuizEditBundle(클릭한 row id)는 해당 교안의 전체 questions + initialActiveQuestionId를 반환합니다.
 *
 * correctOptionIds: 객관식 정답은 복수 선택 허용 — 단일 정답도 배열에 1개로 표현.
 */

/** 교안별 전체 문제 묶음 */
export const MOCK_EDIT_BY_MATERIAL = {
  'mat-ds-w1': {
    materialId: 'mat-ds-w1',
    questions: [
      {
        id: 'quiz-1',
        content: '스택과 큐의 차이를 설명하시오.',
        type: 'shortAnswer',
        options: [],
        correctOptionIds: [],
        shortAnswer: '스택은 LIFO, 큐는 FIFO입니다.',
        explanation: '접근 순서를 중심으로 비교하면 됩니다.',
      },
      {
        id: 'quiz-2',
        content: '시간 복잡도 O(n log n)인 정렬 알고리즘은? (해당하는 보기를 모두 고르세요)',
        type: 'multipleChoice',
        options: [
          { id: 'quiz-2-o0', text: '병합 정렬' },
          { id: 'quiz-2-o1', text: '버블 정렬' },
          { id: 'quiz-2-o2', text: '삽입 정렬' },
          { id: 'quiz-2-o3', text: '힙 정렬' },
        ],
        correctOptionIds: ['quiz-2-o0', 'quiz-2-o3'],
        shortAnswer: '',
        explanation: '병합 정렬·힙 정렬 등이 대표적으로 O(n log n)입니다.',
      },
    ],
  },
  'mat-ds-w2': {
    materialId: 'mat-ds-w2',
    questions: [
      {
        id: 'quiz-3',
        content: '이진 탐색 트리의 최악 시간 복잡도는?',
        type: 'multipleChoice',
        options: [
          { id: 'quiz-3-o0', text: 'O(log n)' },
          { id: 'quiz-3-o1', text: 'O(n)' },
          { id: 'quiz-3-o2', text: 'O(1)' },
        ],
        correctOptionIds: ['quiz-3-o1'],
        shortAnswer: '',
        explanation: '편향 트리가 되면 높이가 O(n)이 될 수 있습니다.',
      },
    ],
  },
}

/** 목록 row id → 소속 교안 id */
export const MOCK_QUIZ_ROW_TO_MATERIAL = {
  'quiz-1': 'mat-ds-w1',
  'quiz-2': 'mat-ds-w1',
  'quiz-3': 'mat-ds-w2',
}

const DEFAULT_MATERIAL_ID = 'mat-ds-w1'

function resolveMaterialIdForRow(quizId) {
  if (quizId != null && quizId !== '' && MOCK_QUIZ_ROW_TO_MATERIAL[quizId]) {
    return MOCK_QUIZ_ROW_TO_MATERIAL[quizId]
  }
  return DEFAULT_MATERIAL_ID
}

/**
 * @param {string | undefined} quizId 라우트·목록에서 클릭한 row id (quiz-1, quiz-2, …)
 * @returns {{ materialId: string, questions: object[], initialActiveQuestionId: string }}
 */
export function getMockQuizEditBundle(quizId) {
  const id = typeof quizId === 'string' ? quizId.trim() : quizId
  const materialId = resolveMaterialIdForRow(id)
  const src = MOCK_EDIT_BY_MATERIAL[materialId] ?? MOCK_EDIT_BY_MATERIAL[DEFAULT_MATERIAL_ID]

  const initialActiveQuestionId =
    id != null && id !== '' && src.questions.some((q) => q.id === id)
      ? id
      : src.questions[0].id

  return {
    materialId: src.materialId,
    questions: src.questions,
    initialActiveQuestionId,
  }
}

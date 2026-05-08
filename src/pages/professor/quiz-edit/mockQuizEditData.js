/**
 * 퀴즈 수정 화면용 mock (관리 목록의 quiz-1 ~ quiz-3과 id 정합)
 * 편집기 상태 형식: type은 multipleChoice | shortAnswer
 *
 * correctOptionIds: 객관식 정답은 복수 선택을 허용 — 단일 정답도 배열에 1개로 표현.
 */

export const MOCK_QUIZ_EDIT_BY_ID = {
  'quiz-1': {
    materialId: 'mat-ds-w1',
    questions: [
      {
        id: 'preload-q1',
        content: '스택과 큐의 차이를 설명하시오.',
        type: 'shortAnswer',
        options: [],
        correctOptionIds: [],
        shortAnswer: '스택은 LIFO, 큐는 FIFO입니다.',
        explanation: '접근 순서를 중심으로 비교하면 됩니다.',
      },
    ],
  },
  'quiz-2': {
    materialId: 'mat-ds-w1',
    questions: [
      {
        id: 'preload-q2',
        content: '시간 복잡도 O(n log n)인 정렬 알고리즘은? (해당하는 보기를 모두 고르세요)',
        type: 'multipleChoice',
        options: [
          { id: 'preload-q2-o0', text: '병합 정렬' },
          { id: 'preload-q2-o1', text: '버블 정렬' },
          { id: 'preload-q2-o2', text: '삽입 정렬' },
          { id: 'preload-q2-o3', text: '힙 정렬' },
        ],
        correctOptionIds: ['preload-q2-o0', 'preload-q2-o3'],
        shortAnswer: '',
        explanation: '병합 정렬·힙 정렬 등이 대표적입니다.',
      },
    ],
  },
  'quiz-3': {
    materialId: 'mat-ds-w2',
    questions: [
      {
        id: 'preload-q3',
        content: '이진 탐색 트리의 최악 시간 복잡도는?',
        type: 'multipleChoice',
        options: [
          { id: 'preload-q3-o0', text: 'O(log n)' },
          { id: 'preload-q3-o1', text: 'O(n)' },
          { id: 'preload-q3-o2', text: 'O(1)' },
        ],
        correctOptionIds: ['preload-q3-o1'],
        shortAnswer: '',
        explanation: '편향 트리가 되면 높이가 O(n)이 될 수 있습니다.',
      },
    ],
  },
}

/** 알 수 없는 quizId일 때 기본 번들 (데모용) */
export const MOCK_QUIZ_EDIT_FALLBACK = MOCK_QUIZ_EDIT_BY_ID['quiz-1']

export function getMockQuizEditBundle(quizId) {
  if (quizId != null && MOCK_QUIZ_EDIT_BY_ID[quizId]) {
    return MOCK_QUIZ_EDIT_BY_ID[quizId]
  }
  return MOCK_QUIZ_EDIT_FALLBACK
}

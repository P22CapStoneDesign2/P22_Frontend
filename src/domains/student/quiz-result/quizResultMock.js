/**
 * 학생 퀴즈 결과 mock 데이터 (서버 채점 결과 가정).
 * attemptId로 조회합니다.
 */
const MOCK_RESULT_BY_ATTEMPT_ID = {
  'mock-attempt-1': {
    attemptId: 'mock-attempt-1',
    materialId: 'mat-ds-w1',
    questions: [
      {
        id: 'q-1',
        questionNumber: 1,
        content: '스택의 특징으로 올바른 것은?',
        type: 'multipleChoice',
        options: [
          { id: 'q-1-o-1', text: 'FIFO 구조이다.' },
          { id: 'q-1-o-2', text: 'LIFO 구조이다.' },
          { id: 'q-1-o-3', text: '정렬 알고리즘이다.' },
          { id: 'q-1-o-4', text: '그래프 탐색 방식이다.' },
        ],
        correctOptionId: 'q-1-o-2',
        correctAnswer: null,
        userSelectedOptionId: 'q-1-o-1',
        userShortAnswer: null,
        isCorrect: false,
        explanation: '스택은 마지막에 들어온 데이터가 먼저 나가는 LIFO 구조입니다.',
      },
      {
        id: 'q-2',
        questionNumber: 2,
        content: '큐의 대표적인 데이터 처리 방식을 입력하세요.',
        type: 'shortAnswer',
        options: [],
        correctOptionId: null,
        correctAnswer: 'FIFO',
        userSelectedOptionId: null,
        userShortAnswer: 'FIFO',
        isCorrect: true,
        explanation: '큐는 먼저 들어온 데이터가 먼저 나가는 FIFO 구조입니다.',
      },
    ],
  },
  'mock-attempt-2': {
    attemptId: 'mock-attempt-2',
    materialId: 'mat-algo-intro',
    questions: [
      {
        id: 'algo-r1',
        questionNumber: 1,
        content: '시간 복잡도 O(n log n)에 해당하는 정렬을 고르세요.',
        type: 'multipleChoice',
        options: [
          { id: 'algo-r1-o1', text: '삽입 정렬' },
          { id: 'algo-r1-o2', text: '선택 정렬' },
          { id: 'algo-r1-o3', text: '병합 정렬' },
        ],
        correctOptionId: 'algo-r1-o3',
        correctAnswer: null,
        userSelectedOptionId: 'algo-r1-o3',
        userShortAnswer: null,
        isCorrect: true,
        explanation: '병합 정렬은 대표적인 O(n log n) 정렬입니다.',
      },
      {
        id: 'algo-r2',
        questionNumber: 2,
        content: 'DFS의 풀네임을 작성하세요.',
        type: 'shortAnswer',
        options: [],
        correctOptionId: null,
        correctAnswer: 'Depth First Search',
        userSelectedOptionId: null,
        userShortAnswer: 'Deep First Search',
        isCorrect: false,
        explanation: '정확한 명칭은 Depth First Search입니다.',
      },
    ],
  },
}

const FALLBACK_RESULT = MOCK_RESULT_BY_ATTEMPT_ID['mock-attempt-1']

export function getQuizResultByAttemptId(attemptId) {
  if (attemptId && MOCK_RESULT_BY_ATTEMPT_ID[attemptId]) {
    return MOCK_RESULT_BY_ATTEMPT_ID[attemptId]
  }
  return FALLBACK_RESULT
}

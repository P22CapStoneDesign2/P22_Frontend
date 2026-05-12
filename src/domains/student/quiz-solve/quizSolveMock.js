/**
 * 교안별 mock 문제 (API 연동 전)
 * type: multipleChoice | shortAnswer
 */

const SHARED_TWO_QUESTIONS = [
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
  },
  {
    id: 'q-2',
    questionNumber: 2,
    content: '큐의 대표적인 데이터 처리 방식을 입력하세요.',
    type: 'shortAnswer',
    options: [],
  },
]

const EXTENDED_SET = [
  ...SHARED_TWO_QUESTIONS,
  {
    id: 'q-3',
    questionNumber: 3,
    content: '이진 탐색의 전제 조건은?',
    type: 'shortAnswer',
    options: [],
  },
]

const MOCK_BY_MATERIAL = {
  'mat-ds-w1': SHARED_TWO_QUESTIONS,
  'mat-ds-w2': EXTENDED_SET,
  'mat-ds-mid': SHARED_TWO_QUESTIONS,
  'mat-algo-intro': [
    {
      id: 'algo-q1',
      questionNumber: 1,
      content: '시간 복잡도 O(n log n)을 가질 수 있는 정렬은?',
      type: 'multipleChoice',
      options: [
        { id: 'algo-q1-a', text: '병합 정렬' },
        { id: 'algo-q1-b', text: '버블 정렬' },
        { id: 'algo-q1-c', text: '삽입 정렬' },
      ],
    },
    {
      id: 'algo-q2',
      questionNumber: 2,
      content: 'DFS는 무엇의 약자인가요?',
      type: 'shortAnswer',
      options: [],
    },
  ],
  'mat-algo-greedy': SHARED_TWO_QUESTIONS,
  'mat-algo-dp': SHARED_TWO_QUESTIONS,
  'mat-db-w1': SHARED_TWO_QUESTIONS,
  'mat-db-sql': EXTENDED_SET,
}

export function getQuestionsForMaterial(materialId) {
  if (materialId && MOCK_BY_MATERIAL[materialId]) {
    return MOCK_BY_MATERIAL[materialId]
  }
  return SHARED_TWO_QUESTIONS
}

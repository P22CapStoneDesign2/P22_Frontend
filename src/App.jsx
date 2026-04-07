import { useEffect, useRef, useState } from 'react'
import './QuizApp.css'

/**
 * 더미 퀴즈 데이터
 * answer: 정답 보기의 인덱스 (0~3)
 */
const quizData = [
  {
    id: 1,
    question: '다음 중 가장 기본적인 디자인 패턴은?',
    options: ['싱글턴 패턴', '팩토리 패턴', '전략 패턴', '옵저버 패턴'],
    answer: 2,
    explanation:
      '전략 패턴은 알고리즘군을 캡슐화하여 교체 가능하게 만드는 대표적인 패턴이다.',
    material:
      '전략 패턴은 실행 중 알고리즘을 변경할 수 있도록 인터페이스와 구현 클래스를 분리하는 방식이다.',
  },
  {
    id: 2,
    question: '객체 생성 책임을 분리하는 패턴은?',
    options: ['팩토리 패턴', '데코레이터 패턴', '어댑터 패턴', '템플릿 메서드 패턴'],
    answer: 0,
    explanation: '팩토리 패턴은 객체 생성 책임을 별도 로직으로 분리한다.',
    material: '팩토리 패턴은 생성 로직을 캡슐화하여 코드 결합도를 낮추는 데 사용된다.',
  },
  {
    id: 3,
    question: '행동을 런타임에 바꿔 끼우기 좋은 패턴은?',
    options: ['싱글턴 패턴', '전략 패턴', '프록시 패턴', '빌더 패턴'],
    answer: 1,
    explanation: '전략 패턴은 런타임에 알고리즘을 교체하기 좋다.',
    material:
      '전략 패턴은 동일한 인터페이스를 구현한 여러 전략 객체를 상황에 따라 바꿔 사용한다.',
  },
]

const emptyAnswers = () => Array.from({ length: quizData.length }, () => null)

/** 좌측: 문제 번호·제출 답·채점 후 정오 */
function QuestionSidebar({
  currentQuestionIndex,
  answers,
  isGraded,
  onSelectQuestion,
}) {
  return (
    <aside className="quiz-panel quiz-panel--sidebar">
      <h2 className="quiz-panel__title">문제 목록</h2>
      <ul className="quiz-sidebar-list">
        {quizData.map((q, i) => {
          const submitted = answers[i]
          const isCurrent = i === currentQuestionIndex
          const isCorrect =
            isGraded && submitted !== null && submitted === q.answer
          const isWrong =
            isGraded && (submitted === null || submitted !== q.answer)

          return (
            <li key={q.id}>
              <button
                type="button"
                className={`quiz-sidebar-item ${isCurrent ? 'quiz-sidebar-item--active' : ''}`}
                onClick={() => onSelectQuestion(i)}
              >
                <span className="quiz-sidebar-item__num">문제 {i + 1}</span>
                <span className="quiz-sidebar-item__answer">
                  {submitted !== null && submitted !== undefined ? (
                    <>
                      <span className="quiz-sidebar-item__label">
                        제출: {q.options[submitted]}
                      </span>
                      {isGraded && (
                        <span
                          className={`quiz-badge ${isCorrect ? 'quiz-badge--ok' : 'quiz-badge--ng'}`}
                        >
                          {isWrong ? '틀림' : '맞음'}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="quiz-sidebar-item__empty" aria-hidden="true" />
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

/** 중앙: 지문·보기·정답 제출·이전/다음·(채점 후) 해설 */
function QuestionCenter({
  currentQuestionIndex,
  selectedOption,
  answers,
  isGraded,
  toastMessage,
  onSelectOption,
  onPrev,
  onNext,
}) {
  const q = quizData[currentQuestionIndex]
  const submitted = answers[currentQuestionIndex]
  const readOnly = isGraded

  return (
    <main className="quiz-panel quiz-panel--main">
      <div className="quiz-main__head">
        <span className="quiz-main__badge">문제 {currentQuestionIndex + 1}</span>
        <p className="quiz-main__question">{q.question}</p>
      </div>

      <div className="quiz-options" role="radiogroup" aria-label="보기">
        {q.options.map((label, optIdx) => {
          /* 채점 전: 임시 선택이 있으면 그것만 강조, 없으면 제출된 답 반영 */
          const isSelected =
            !readOnly &&
            (selectedOption !== null && selectedOption !== undefined
              ? optIdx === selectedOption
              : submitted !== null && submitted !== undefined && optIdx === submitted)
          const isCorrect = optIdx === q.answer
          const isUserWrong =
            isGraded &&
            submitted !== null &&
            submitted !== undefined &&
            optIdx === submitted &&
            submitted !== q.answer

          let optionClass = 'quiz-option'
          if (!readOnly && isSelected) optionClass += ' quiz-option--selected'
          if (readOnly) {
            if (isCorrect) optionClass += ' quiz-option--correct'
            if (isUserWrong) optionClass += ' quiz-option--wrong'
          }

          return (
            <button
              key={optIdx}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={readOnly}
              className={optionClass}
              onClick={() => onSelectOption(optIdx)}
            >
              <span className="quiz-option__key">{String.fromCharCode(65 + optIdx)}</span>
              <span className="quiz-option__text">{label}</span>
            </button>
          )
        })}
      </div>

      {toastMessage ? (
        <p className="quiz-toast" role="status">
          {toastMessage}
        </p>
      ) : null}

      <div className="quiz-nav">
        <button type="button" className="quiz-btn quiz-btn--ghost" onClick={onPrev} disabled={currentQuestionIndex === 0}>
          이전 문제
        </button>
        <button
          type="button"
          className="quiz-btn quiz-btn--ghost"
          onClick={onNext}
          disabled={currentQuestionIndex === quizData.length - 1}
        >
          다음 문제
        </button>
      </div>

      {isGraded ? (
        <section className="quiz-explanation" aria-label="해설">
          <h3 className="quiz-explanation__title">해설</h3>
          <p className="quiz-explanation__body">{q.explanation}</p>
        </section>
      ) : null}

      <div className="quiz-progress">
        {currentQuestionIndex + 1} / {quizData.length}
      </div>
    </main>
  )
}

/** 우측: 채점 전 — 정답 제출·퀴즈 채점 / 채점 후 — 교안 */
function RightPanel({
  isGraded,
  score,
  total,
  material,
  onSubmitAnswer,
  onGradeQuiz,
}) {
  return (
    <aside className="quiz-panel quiz-panel--actions">
      {isGraded ? (
        <>
          <div className="quiz-score-card">
            <span className="quiz-score-card__label">점수</span>
            <span className="quiz-score-card__value">
              {score} / {total}
            </span>
            <span className="quiz-score-card__hint">맞힌 문항 수</span>
          </div>
          <section className="quiz-material">
            <h2 className="quiz-panel__title">교안</h2>
            <p className="quiz-material__body">{material}</p>
          </section>
        </>
      ) : (
        <>
          <h2 className="quiz-panel__title">제출 · 채점</h2>
          <p className="quiz-panel__hint">현재 문제의 답은 아래에서 확정할 수 있습니다.</p>
          <button type="button" className="quiz-btn quiz-btn--primary quiz-btn--block" onClick={onSubmitAnswer}>
            정답 제출
          </button>
          <button type="button" className="quiz-btn quiz-btn--accent quiz-btn--block" onClick={onGradeQuiz}>
            퀴즈 채점하기
          </button>
        </>
      )}
    </aside>
  )
}

/**
 * 상태
 * - currentQuestionIndex: 보고 있는 문제 인덱스
 * - selectedOption: 현재 문제에서의 임시 선택 (보기 인덱스 또는 null)
 * - answers: 문제별 제출된 답 (null이면 미제출)
 * - isGraded: 채점 완료 여부
 * - score: 정답 개수
 */
export default function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [answers, setAnswers] = useState(emptyAnswers)
  const [isGraded, setIsGraded] = useState(false)
  const [score, setScore] = useState(0)
  const [toastMessage, setToastMessage] = useState('')
  const toastTimerRef = useRef(null)

  /** 문제 이동 시: 제출된 답이 있으면 selectedOption에 반영, 없으면 null */
  useEffect(() => {
    const saved = answers[currentQuestionIndex]
    setSelectedOption(saved !== null && saved !== undefined ? saved : null)
  }, [currentQuestionIndex, answers])

  const showToast = (msg) => {
    setToastMessage(msg)
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage('')
      toastTimerRef.current = null
    }, 2800)
  }

  const handleSelectOption = (optIdx) => {
    if (isGraded) return
    setSelectedOption(optIdx)
  }

  /** 정답 제출: 임시 선택을 해당 문항의 제출 답으로 저장 */
  const handleSubmitAnswer = () => {
    if (isGraded) return
    if (selectedOption === null || selectedOption === undefined) {
      showToast('보기를 선택한 뒤 정답 제출을 눌러 주세요.')
      return
    }
    setAnswers((prev) => {
      const next = [...prev]
      next[currentQuestionIndex] = selectedOption
      return next
    })
  }

  const handleGradeQuiz = () => {
    if (isGraded) return
    let correct = 0
    for (let i = 0; i < quizData.length; i++) {
      const u = answers[i]
      if (u !== null && u !== undefined && u === quizData[i].answer) correct += 1
    }
    setScore(correct)
    setIsGraded(true)
  }

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index)
  }

  const handlePrev = () => {
    setCurrentQuestionIndex((i) => Math.max(0, i - 1))
  }

  const handleNext = () => {
    setCurrentQuestionIndex((i) => Math.min(quizData.length - 1, i + 1))
  }

  const currentQ = quizData[currentQuestionIndex]

  return (
    <div className="quiz-app">
      <header className="quiz-header">
        <h1 className="quiz-header__title">{isGraded ? '퀴즈 결과' : '퀴즈 풀기'}</h1>
        {isGraded ? (
          <div className="quiz-header__score" aria-live="polite">
            총점 <strong>{score}</strong> / {quizData.length}
          </div>
        ) : null}
      </header>

      <div className="quiz-layout">
        <QuestionSidebar
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          isGraded={isGraded}
          onSelectQuestion={goToQuestion}
        />
        <QuestionCenter
          currentQuestionIndex={currentQuestionIndex}
          selectedOption={selectedOption}
          answers={answers}
          isGraded={isGraded}
          toastMessage={toastMessage}
          onSelectOption={handleSelectOption}
          onPrev={handlePrev}
          onNext={handleNext}
        />
        <RightPanel
          isGraded={isGraded}
          score={score}
          total={quizData.length}
          material={currentQ.material}
          onSubmitAnswer={handleSubmitAnswer}
          onGradeQuiz={handleGradeQuiz}
        />
      </div>
    </div>
  )
}

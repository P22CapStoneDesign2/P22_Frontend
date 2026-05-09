import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import QuizQuestionFormList from './QuizQuestionFormList.jsx'
import QuestionNavigator from './QuestionNavigator.jsx'
import BottomActions from './BottomActions.jsx'
import { cloneQuestionsForState, createNewQuestion, genQuizItemId } from './quizCreateUtils.js'

/**
 * 퀴즈 생성·수정 공통 본문
 * - questions 단일 원천, 번호는 인덱스+1만 사용
 * - 모달 문구·저장 DTO는 상위에서 주입 (과도한 분기 없이 콜백으로 통일)
 *
 * @param {object} props
 * @param {string} props.materialId
 * @param {string | null} [props.quizId] 수정 시에만 전달
 * @param {Array<object> | null} [props.initialQuestions] 있으면 preload (복사본으로 state 초기화)
 * @param {string | null} [props.initialActiveQuestionId] 수정 진입 시 활성·스크롤 대상 문항 id
 * @param {string} props.confirmMessage
 * @param {(materialId: string, questions: object[], quizId: string | null) => object} props.buildDto
 */
export default function QuizEditorContent({
  materialId,
  quizId = null,
  initialQuestions = null,
  initialActiveQuestionId = null,
  confirmMessage,
  buildDto,
}) {
  const navigate = useNavigate()
  const formRefs = useRef({})

  const [questions, setQuestions] = useState(() => {
    if (initialQuestions != null && initialQuestions.length > 0) {
      return cloneQuestionsForState(initialQuestions)
    }
    return [createNewQuestion()]
  })

  const [activeQuestionId, setActiveQuestionId] = useState(() => {
    const qs =
      initialQuestions != null && initialQuestions.length > 0
        ? cloneQuestionsForState(initialQuestions)
        : [createNewQuestion()]
    const preferred = initialActiveQuestionId
    if (preferred != null && preferred !== '' && qs.some((q) => q.id === preferred)) {
      return preferred
    }
    return qs[0].id
  })

  const [saveModalOpen, setSaveModalOpen] = useState(false)

  const scrollToQuestion = (questionId, behavior = 'smooth') => {
    const el = formRefs.current[questionId]
    el?.scrollIntoView({ behavior, block: 'start' })
  }

  useLayoutEffect(() => {
    if (initialActiveQuestionId == null || initialActiveQuestionId === '') return
    scrollToQuestion(initialActiveQuestionId, 'instant')
  }, [initialActiveQuestionId])

  const handleQuestionNavigate = (questionId) => {
    setActiveQuestionId(questionId)
    scrollToQuestion(questionId)
  }

  const handleAddQuestion = () => {
    const newQ = createNewQuestion()
    setQuestions((prev) => [...prev, newQ])
    setActiveQuestionId(newQ.id)
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToQuestion(newQ.id)
        })
      })
    })
  }

  const handleContentChange = (questionId, content) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, content } : q)))
  }

  const handleTypeChange = (questionId, type) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q
        if (type === 'shortAnswer') {
          return { ...q, type: 'shortAnswer', correctOptionIds: [] }
        }
        const existing = q.options ?? []
        const opts =
          existing.length >= 2
            ? existing
            : [
                { id: genQuizItemId(), text: '' },
                { id: genQuizItemId(), text: '' },
              ]
        return {
          ...q,
          type: 'multipleChoice',
          options: opts,
          correctOptionIds: [],
          shortAnswer: '',
        }
      }),
    )
  }

  const handleOptionTextChange = (questionId, optionId, text) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q
        return {
          ...q,
          options: (q.options ?? []).map((o) => (o.id === optionId ? { ...o, text } : o)),
        }
      }),
    )
  }

  /**
   * 객관식 정답은 복수 선택. 동일 ID가 이미 있으면 해제, 없으면 추가 (토글).
   * options 변경/삭제 시 잔존 ID를 정리하지는 않음 — 보기 ID 자체는 안정적이므로 충분.
   */
  const handleCorrectOptionChange = (questionId, optionId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q
        const current = Array.isArray(q.correctOptionIds) ? q.correctOptionIds : []
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId]
        return { ...q, correctOptionIds: next }
      }),
    )
  }

  const handleAddOption = (questionId) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== questionId
          ? q
          : { ...q, options: [...(q.options ?? []), { id: genQuizItemId(), text: '' }] },
      ),
    )
  }

  const handleShortAnswerChange = (questionId, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, shortAnswer: value } : q)),
    )
  }

  const handleExplanationChange = (questionId, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, explanation: value } : q)),
    )
  }

  const handleSaveClick = () => {
    setSaveModalOpen(true)
  }

  const handleConfirmSave = () => {
    const dto = buildDto(materialId, questions, quizId)
    console.log(dto)
    setSaveModalOpen(false)
    navigate('/professor/quizzes')
  }

  const handleCancelSave = () => {
    setSaveModalOpen(false)
  }

  return (
    <>
      <div className="edu-quiz-create-layout">
        <div className="edu-quiz-create-main">
          <QuizQuestionFormList
            questions={questions}
            formRefs={formRefs}
            onContentChange={handleContentChange}
            onTypeChange={handleTypeChange}
            onOptionTextChange={handleOptionTextChange}
            onCorrectOptionChange={handleCorrectOptionChange}
            onAddOption={handleAddOption}
            onShortAnswerChange={handleShortAnswerChange}
            onExplanationChange={handleExplanationChange}
          />
          <BottomActions onAddQuestion={handleAddQuestion} onSaveClick={handleSaveClick} />
        </div>
        <aside className="edu-quiz-create-aside">
          <QuestionNavigator
            questions={questions}
            activeQuestionId={activeQuestionId}
            onQuestionNavigate={handleQuestionNavigate}
          />
        </aside>
      </div>

      <ConfirmModal
        isOpen={saveModalOpen}
        message={confirmMessage}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />
    </>
  )
}

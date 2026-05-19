import { useLayoutEffect, useRef, useState } from 'react'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import QuizQuestionFormList from './QuizQuestionFormList.jsx'
import QuestionNavigator from './QuestionNavigator.jsx'
import BottomActions from './BottomActions.jsx'
import { cloneQuestionsForState, createNewQuestion, genQuizItemId } from './quizCreateUtils.js'

/**
 * 퀴즈 생성·수정 공통 본문
 * - title/description/questions 단일 원천, 번호는 인덱스+1만 사용
 * - 저장은 상위에서 주입한 `onConfirmSave` 콜백에 위임
 *
 * @param {object} props
 * @param {string} props.materialId — 표시·미래 anchorId 매핑용. 현재 API에는 보내지 않음.
 * @param {string | null} [props.quizId] 수정 시에만 전달
 * @param {string} [props.initialTitle]
 * @param {string} [props.initialDescription]
 * @param {Array<object> | null} [props.initialQuestions] 있으면 preload (복사본으로 state 초기화)
 * @param {string | null} [props.initialActiveQuestionId]
 * @param {string} props.confirmMessage
 * @param {(payload: { materialId: string, quizId: string | null, title: string, description: string, questions: object[] }) => Promise<void>} props.onConfirmSave
 */
export default function QuizEditorContent({
  materialId,
  quizId = null,
  initialTitle = '',
  initialDescription = '',
  initialQuestions = null,
  initialActiveQuestionId = null,
  confirmMessage,
  onConfirmSave,
}) {
  const formRefs = useRef({})

  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

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
    if (saving) return
    if (!title.trim()) {
      setSaveError('퀴즈 제목을 입력해 주세요.')
      return
    }
    setSaveError('')
    setSaveModalOpen(true)
  }

  const handleConfirmSave = async () => {
    setSaveModalOpen(false)
    setSaving(true)
    setSaveError('')
    try {
      await onConfirmSave({
        materialId,
        quizId,
        title: title.trim(),
        description: description.trim(),
        questions,
      })
    } catch (e) {
      setSaveError(e?.response?.data?.message || e?.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelSave = () => {
    setSaveModalOpen(false)
  }

  return (
    <>
      <div className="edu-quiz-create-layout">
        <div className="edu-quiz-create-main">
          <section className="edu-quiz-editor-meta" aria-label="퀴즈 세트 정보">
            <label className="edu-quiz-editor-meta__field">
              <span className="edu-quiz-editor-meta__label">제목</span>
              <input
                type="text"
                className="edu-quiz-editor-meta__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 3장 운영체제 기초 퀴즈"
                disabled={saving}
                maxLength={200}
              />
            </label>
            <label className="edu-quiz-editor-meta__field">
              <span className="edu-quiz-editor-meta__label">설명 (선택)</span>
              <textarea
                className="edu-quiz-editor-meta__textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="퀴즈 설명을 입력하세요"
                disabled={saving}
                rows={2}
                maxLength={500}
              />
            </label>
          </section>

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

          {saveError ? (
            <p className="edu-quiz-editor-error" role="alert">
              {saveError}
            </p>
          ) : null}

          <BottomActions
            onAddQuestion={handleAddQuestion}
            onSaveClick={handleSaveClick}
            saving={saving}
          />
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

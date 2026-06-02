import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal.jsx'
import { useToast } from '../../../components/ui/Toast/useToast.js'
import { TOAST_MESSAGES } from '../../../shared/feedback/toastMessages.js'
import QuizQuestionFormList from './QuizQuestionFormList.jsx'
import QuestionNavigator from './QuestionNavigator.jsx'
import QuizEditorFloatingActions from './QuizEditorFloatingActions.jsx'
import { ROUTES } from '../../../shared/constants/routes.js'
import { persistQuizWithQuestions } from '../../quiz/quizPersistenceService.js'
import { parseLessonIdForApi } from '../../quiz/mappers/quizMapper.js'
import { cloneQuestionsForState, createNewQuestion, genQuizItemId } from './quizCreateUtils.js'
import {
  formatMissingAnswersAlert,
  getQuestionNumbersMissingAnswers,
} from './quizEditorValidation.js'
import { useQuizFormActiveQuestionSpy } from './useQuizFormActiveQuestionSpy.js'

const CANCEL_CONFIRM_MESSAGE = '작업을 취소하시겠습니까?'
const DELETE_OPTION_CONFIRM_MESSAGE = '보기를 삭제하시겠습니까?'
const MC_OPTION_MIN_COUNT_MESSAGE = '객관식 보기는 최소 2개 이상 필요합니다.'
const MIN_MC_OPTIONS = 2

/**
 * 퀴즈 생성·수정 공통 본문
 * - questions 단일 원천, 화면 번호는 displayNumberOffset + index + 1 (생성 시 기존 문항 수 반영)
 * - 모달 문구·저장 DTO는 상위에서 주입 (과도한 분기 없이 콜백으로 통일)
 *
 * @param {object} props
 * @param {string} props.materialId
 * @param {string | null} [props.quizId] 수정 시에만 전달
 * @param {Array<object> | null} [props.initialQuestions] 있으면 preload (복사본으로 state 초기화)
 * @param {string | null} [props.initialActiveQuestionId] 수정 진입 시 활성·스크롤 대상 문항 id
 * @param {string} props.confirmMessage
 * @param {(materialId: string, questions: object[], quizId: string | null) => object} props.buildDto
 * @param {boolean} [props.isViewerMode] 학생 보기 전용 — 수정·저장·추가 비활성
 * @param {boolean} [props.isMaterialEditMode] 교안 전체 문항 수정
 * @param {string[]} [props.initialPersistedQuestionIds] 수정 진입 시 저장소에 있던 문항 id
 * @param {boolean} [props.professorFeaturesLocked] PROF PENDING 등 — 저장·추가 비활성
 * @param {string} [props.lessonId] POST /api/quiz lessonId (materialId보다 우선)
 */
export default function QuizEditorContent({
  materialId,
  lessonId: lessonIdProp,
  quizId = null,
  initialQuestions = null,
  initialActiveQuestionId = null,
  confirmMessage,
  buildDto,
  isViewerMode = false,
  initialPersistedQuestionIds = [],
  displayNumberOffset = 0,
  professorFeaturesLocked = false,
}) {
  const isEditable = !isViewerMode && !professorFeaturesLocked
  const { showToast } = useToast()
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
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  /** @type {[{ questionId: string, optionId: string } | null]} */
  const [deleteOptionTarget, setDeleteOptionTarget] = useState(null)

  const handleActiveQuestionFromScroll = useCallback((questionId) => {
    setActiveQuestionId(questionId)
  }, [])

  const { markProgrammaticScroll } = useQuizFormActiveQuestionSpy({
    questions,
    formRefs,
    onActiveQuestionChange: handleActiveQuestionFromScroll,
    enabled: isEditable && !isViewerMode,
  })

  const scrollToQuestion = (questionId, behavior = 'smooth') => {
    const el = formRefs.current[questionId]
    el?.scrollIntoView({ behavior, block: 'start' })
  }

  useLayoutEffect(() => {
    if (initialActiveQuestionId == null || initialActiveQuestionId === '') return
    markProgrammaticScroll()
    scrollToQuestion(initialActiveQuestionId, 'instant')
  }, [initialActiveQuestionId, markProgrammaticScroll])

  useLayoutEffect(() => {
    if (!isViewerMode) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeQuestionId, isViewerMode])

  const handleQuestionNavigate = (questionId) => {
    markProgrammaticScroll()
    setActiveQuestionId(questionId)
    if (isViewerMode) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    scrollToQuestion(questionId)
  }

  const handleAddQuestion = () => {
    if (!isEditable) return
    const newQ = createNewQuestion()
    setQuestions((prev) => [...prev, newQ])
    markProgrammaticScroll()
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
    if (!isEditable) return
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, content } : q)))
  }

  const handleTypeChange = (questionId, type) => {
    if (!isEditable) return
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
    if (!isEditable) return
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
   */
  const handleCorrectOptionChange = (questionId, optionId) => {
    if (!isEditable) return
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
    if (!isEditable) return
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== questionId
          ? q
          : { ...q, options: [...(q.options ?? []), { id: genQuizItemId(), text: '' }] },
      ),
    )
  }

  const handleDeleteOptionRequest = (questionId, optionId) => {
    if (!isEditable) return
    const question = questions.find((q) => q.id === questionId)
    const optionCount = question?.options?.length ?? 0
    if (optionCount <= MIN_MC_OPTIONS) {
      window.alert(MC_OPTION_MIN_COUNT_MESSAGE)
      return
    }
    setDeleteOptionTarget({ questionId, optionId })
  }

  const handleConfirmDeleteOption = () => {
    if (!deleteOptionTarget) return
    const { questionId, optionId } = deleteOptionTarget
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q
        return {
          ...q,
          options: (q.options ?? []).filter((o) => o.id !== optionId),
          correctOptionIds: (Array.isArray(q.correctOptionIds) ? q.correctOptionIds : []).filter(
            (id) => id !== optionId,
          ),
        }
      }),
    )
    setDeleteOptionTarget(null)
  }

  const handleCancelDeleteOption = () => {
    setDeleteOptionTarget(null)
  }

  const handleShortAnswerChange = (questionId, value) => {
    if (!isEditable) return
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, shortAnswer: value } : q)),
    )
  }

  const handleExplanationChange = (questionId, value) => {
    if (!isEditable) return
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, explanation: value } : q)),
    )
  }

  const handleSaveClick = () => {
    if (!isEditable) return
    setSaveModalOpen(true)
  }

  const handleConfirmSave = async () => {
    if (!isEditable) return

    const missing = getQuestionNumbersMissingAnswers(questions, displayNumberOffset)
    if (missing.length > 0) {
      window.alert(formatMissingAnswersAlert(missing))
      return
    }

    const resolvedLessonId =
      lessonIdProp != null && String(lessonIdProp).trim()
        ? String(lessonIdProp).trim()
        : String(materialId ?? '').trim()

    if (parseLessonIdForApi(resolvedLessonId) == null) {
      window.alert('교안을 선택해주세요.')
      return
    }

    const dto = buildDto(materialId, questions, quizId)
    const titleFromQuestion = questions[0]?.content?.trim() || '새 퀴즈'
    try {
      await persistQuizWithQuestions({
        quizId,
        lessonId: resolvedLessonId,
        title: titleFromQuestion,
        description: '',
        questions,
        initialPersistedQuestionIds,
      })
      void dto
      showToast(quizId ? TOAST_MESSAGES.quizUpdated : TOAST_MESSAGES.quizSaved)
      setSaveModalOpen(false)
      navigate(ROUTES.professorQuizzes, {
        state: { lessonId: resolvedLessonId, courseId: resolvedLessonId },
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'LESSON_ID_REQUIRED') {
        window.alert('교안을 선택해주세요.')
        return
      }
      const msg = err instanceof Error ? err.message : '저장에 실패했습니다.'
      console.error('QUIZ SAVE FAILED', msg, err)
      window.alert(msg)
    }
  }

  const handleCancelSave = () => {
    setSaveModalOpen(false)
  }

  const handleCancelClick = () => {
    setIsCancelModalOpen(true)
  }

  const handleDismissCancelModal = () => {
    setIsCancelModalOpen(false)
  }

  const handleConfirmCancel = () => {
    setIsCancelModalOpen(false)
    navigate(ROUTES.professorQuizzes, {
      state: { lessonId: materialId, courseId: materialId },
    })
  }

  return (
    <>
      <div className="edu-quiz-create-layout">
        <div className="edu-quiz-create-main">
          {isViewerMode && questions.length > 0 ? (
            <p className="edu-quiz-create-main__progress" aria-live="polite">
              문제{' '}
              {displayNumberOffset +
                (questions.findIndex((q) => q.id === activeQuestionId) + 1 || 1)}{' '}
              / {displayNumberOffset + questions.length}
            </p>
          ) : null}
          <QuizQuestionFormList
            questions={questions}
            formRefs={formRefs}
            activeQuestionId={activeQuestionId}
            displayNumberOffset={displayNumberOffset}
            isEditable={isEditable}
            onContentChange={handleContentChange}
            onTypeChange={handleTypeChange}
            onOptionTextChange={handleOptionTextChange}
            onCorrectOptionChange={handleCorrectOptionChange}
            onAddOption={handleAddOption}
            onDeleteOption={handleDeleteOptionRequest}
            onShortAnswerChange={handleShortAnswerChange}
            onExplanationChange={handleExplanationChange}
          />
        </div>
        <aside className="edu-quiz-create-aside">
          <div className="edu-quiz-create-aside-inner">
            <QuestionNavigator
              questions={questions}
              activeQuestionId={activeQuestionId}
              displayNumberOffset={displayNumberOffset}
              onQuestionNavigate={handleQuestionNavigate}
            />
            <QuizEditorFloatingActions
              isEditable={isEditable}
              onAddQuestion={handleAddQuestion}
              onSaveClick={handleSaveClick}
              onCancelClick={handleCancelClick}
            />
          </div>
        </aside>
      </div>

      <ConfirmModal
        isOpen={saveModalOpen}
        message={confirmMessage}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />

      <ConfirmModal
        isOpen={isCancelModalOpen}
        message={CANCEL_CONFIRM_MESSAGE}
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmCancel}
        onCancel={handleDismissCancelModal}
      />

      <ConfirmModal
        isOpen={deleteOptionTarget != null}
        message={DELETE_OPTION_CONFIRM_MESSAGE}
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmDeleteOption}
        onCancel={handleCancelDeleteOption}
      />
    </>
  )
}

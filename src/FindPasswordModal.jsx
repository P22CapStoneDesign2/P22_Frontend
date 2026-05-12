import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { requestPasswordReset } from './api/auth'
import './FindPasswordModal.css'

function isValidEmail(value) {
  const v = value.trim()
  if (!v) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

/**
 * 로그인 화면 위 비밀번호 찾기 팝업 (배경 딤·오버레이 클릭 시 닫힘)
 * @param {{ isOpen: boolean; onClose: () => void }} props
 */
export default function FindPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setEmail('')
    setFeedback(null)
    setLoading(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const handleOverlayMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleConfirm = async () => {
    if (feedback?.type === 'success') {
      onClose()
      return
    }

    const trimmed = email.trim()
    if (!trimmed) {
      setFeedback({ type: 'error', text: '아이디(가입 메일 주소)를 입력하세요.' })
      return
    }
    if (!isValidEmail(trimmed)) {
      setFeedback({ type: 'error', text: '이메일 형식이 올바르지 않습니다.' })
      return
    }

    setLoading(true)
    setFeedback(null)
    try {
      await requestPasswordReset(trimmed)
      setFeedback({ type: 'success', text: '받은메일함을 확인해주세요' })
    } catch (error) {
      const status = error.response?.status
      const serverMsg = error.response?.data?.message
      if (status === 404 || status === 400) {
        setFeedback({
          type: 'error',
          text: serverMsg || '메일 주소가 존재하지 않습니다',
        })
      } else {
        setFeedback({
          type: 'error',
          text: serverMsg || '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className="edu-find-password-modal__overlay"
      role="presentation"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        className="edu-find-password-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edu-find-password-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="edu-find-password-modal-title" className="edu-find-password-modal__title">
          비밀번호 찾기
        </h2>
        <p className="edu-find-password-modal__hint">아이디(가입 메일 주소)를 입력하세요</p>
        <label className="edu-find-password-modal__label" htmlFor="edu-find-password-email">
          <span className="visually-hidden">가입 메일 주소</span>
          <input
            id="edu-find-password-email"
            type="email"
            name="find-password-email"
            autoComplete="email"
            className="edu-find-password-modal__input"
            value={email}
            disabled={loading}
            onChange={(e) => {
              setEmail(e.target.value)
              if (feedback) setFeedback(null)
            }}
          />
        </label>
        {feedback ? (
          <p
            className={
              feedback.type === 'success'
                ? 'edu-find-password-modal__msg edu-find-password-modal__msg--success'
                : 'edu-find-password-modal__msg edu-find-password-modal__msg--error'
            }
            role="status"
          >
            {feedback.text}
          </p>
        ) : (
          <p className="edu-find-password-modal__msg-placeholder" aria-hidden="true">
            {'\u00a0'}
          </p>
        )}
        <button
          type="button"
          className="edu-find-password-modal__submit btn btn--surface btn--md"
          disabled={loading}
          onClick={handleConfirm}
        >
          {loading ? '처리 중…' : '확인'}
        </button>
      </div>
    </div>,
    document.body,
  )
}

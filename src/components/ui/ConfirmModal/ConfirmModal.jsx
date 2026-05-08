import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './ConfirmModal.css'

/**
 * @param {object} props
 * @param {'primary' | 'secondary' | 'danger'} [props.variant]
 * @param {boolean} [props.disabled]
 * @param {() => void} [props.onClick]
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export function ModalActionButton({
  variant = 'secondary',
  disabled = false,
  onClick,
  children,
  className = '',
}) {
  return (
    <button
      type="button"
      className={`edu-modal-btn edu-modal-btn--${variant} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function ModalOverlay({ onClick, children }) {
  return (
    <div
      className="edu-modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClick?.()
      }}
    >
      {children}
    </div>
  )
}

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {string} props.message
 * @param {string} [props.title]
 * @param {string} [props.confirmText]
 * @param {string} [props.cancelText]
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onCancel
 * @param {boolean} [props.closeOnOverlayClick]
 * @param {boolean} [props.closeOnEscape]
 * @param {'primary' | 'danger'} [props.confirmVariant]
 * @param {boolean} [props.isConfirmLoading]
 * @param {boolean} [props.disableConfirm]
 */
export default function ConfirmModal({
  isOpen,
  message,
  title,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  confirmVariant = 'primary',
  isConfirmLoading = false,
  disableConfirm = false,
}) {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, closeOnEscape, onCancel])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  if (!isOpen) return null

  const overlayClick = () => {
    if (closeOnOverlayClick) onCancel()
  }

  return createPortal(
    <ModalOverlay onClick={overlayClick}>
      <div
        className="edu-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'edu-modal-title' : undefined}
        aria-describedby="edu-modal-desc"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title ? (
          <h2 id="edu-modal-title" className="edu-modal-title">
            {title}
          </h2>
        ) : null}
        <p id="edu-modal-desc" className="edu-modal-message">
          {message}
        </p>
        <div className="edu-modal-actions">
          <ModalActionButton variant="secondary" onClick={onCancel} disabled={isConfirmLoading}>
            {cancelText}
          </ModalActionButton>
          <ModalActionButton
            variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={disableConfirm || isConfirmLoading}
          >
            {isConfirmLoading ? '처리 중…' : confirmText}
          </ModalActionButton>
        </div>
      </div>
    </ModalOverlay>,
    document.body,
  )
}

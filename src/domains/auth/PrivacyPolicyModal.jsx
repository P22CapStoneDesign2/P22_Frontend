import { Fragment, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { isPrivacyPolicyArticleHeading, PRIVACY_POLICY_TEXT } from './privacyPolicyText.js'
import './PrivacyPolicyModal.css'

/**
 * 개인정보 처리 방침 — 회원가입 동의 링크 클릭 시 표시
 * @param {{ isOpen: boolean; onClose: () => void }} props
 */
export default function PrivacyPolicyModal({ isOpen, onClose }) {
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

  if (!isOpen) return null

  return createPortal(
    <div
      className="edu-privacy-modal__overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="edu-privacy-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edu-privacy-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="edu-privacy-modal__header">
          <h2 id="edu-privacy-modal-title" className="edu-privacy-modal__title">
            개인정보 처리 방침
          </h2>
          <button
            type="button"
            className="edu-privacy-modal__dismiss"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
        <div className="edu-privacy-modal__body">
          {PRIVACY_POLICY_TEXT.split('\n').map((line, i) => (
            <Fragment key={i}>
              {i > 0 ? '\n' : null}
              {isPrivacyPolicyArticleHeading(line) ? (
                <strong className="edu-privacy-modal__article">{line}</strong>
              ) : (
                line
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}

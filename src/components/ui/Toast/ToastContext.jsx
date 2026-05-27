import { useCallback, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ToastContext } from './toastContext.js'
import './Toast.css'

/** @typedef {{ id: string, message: string, variant?: 'success' | 'error' }} ToastItem */

let toastSeq = 0

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState(/** @type {ToastItem[]} */ ([]))
  const timersRef = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message, options = {}) => {
      const text = String(message ?? '').trim()
      if (!text) return

      const id = `toast-${++toastSeq}`
      const variant = options.variant === 'error' ? 'error' : 'success'
      const durationMs = typeof options.durationMs === 'number' ? options.durationMs : 3200

      setToasts((prev) => [...prev, { id, message: text, variant }])

      const timer = setTimeout(() => dismiss(id), durationMs)
      timersRef.current.set(id, timer)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="edu-toast-stack" aria-live="polite" aria-relevant="additions">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`edu-toast edu-toast--${t.variant ?? 'success'}`}
              role="status"
            >
              <p className="edu-toast__message">{t.message}</p>
              <button
                type="button"
                className="edu-toast__close"
                aria-label="알림 닫기"
                onClick={() => dismiss(t.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

import { createContext } from 'react'

/** @type {import('react').Context<{ showToast: (message: string, options?: { variant?: string, durationMs?: number }) => void } | null>} */
export const ToastContext = createContext(null)

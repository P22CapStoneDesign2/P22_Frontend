import { createContext } from 'react'

/**
 * @typedef {object} SessionIdleContextValue
 * @property {() => void} extendSession
 * @property {number} remainingMs
 */

/** @type {import('react').Context<SessionIdleContextValue | null>} */
export const SessionIdleContext = createContext(null)

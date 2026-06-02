import { useContext } from 'react'
import { SessionIdleContext } from './sessionIdleContext.js'

export function useSessionIdle() {
  return useContext(SessionIdleContext)
}

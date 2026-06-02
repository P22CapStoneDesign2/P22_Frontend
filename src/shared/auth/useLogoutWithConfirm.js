import { createElement, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearClientSessionForLogout } from '../../app/headerLogoutHandler.js'
import { ROUTES } from '../constants/routes.js'
import { performLogout } from './performLogout.js'
import { LogoutConfirmModal } from './LogoutConfirmModal.jsx'

const LOGOUT_SUCCESS_MESSAGE = '로그아웃 되었습니다.'

/**
 * @param {{ mode?: 'api' | 'client' }} [options]
 */
export function useLogoutWithConfirm(options = {}) {
  const { mode = 'api' } = options
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const executeLogout = useCallback(async () => {
    setOpen(false)
    if (mode === 'client') {
      clearClientSessionForLogout()
    } else {
      await performLogout()
    }
    window.alert(LOGOUT_SUCCESS_MESSAGE)
    navigate(ROUTES.home, { replace: true })
  }, [mode, navigate])

  const requestLogout = useCallback(() => setOpen(true), [])
  const closeConfirm = useCallback(() => setOpen(false), [])

  const logoutConfirmModal = createElement(LogoutConfirmModal, {
    isOpen: open,
    onConfirm: executeLogout,
    onCancel: closeConfirm,
  })

  return { requestLogout, logoutConfirmModal }
}

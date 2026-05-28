import ConfirmModal from '../../components/ui/ConfirmModal/ConfirmModal.jsx'

/**
 * @param {{ isOpen: boolean, onConfirm: () => void, onCancel: () => void }} props
 */
export function LogoutConfirmModal({ isOpen, onConfirm, onCancel }) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      message="로그아웃 하시겠습니까?"
      confirmText="확인"
      cancelText="취소"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}

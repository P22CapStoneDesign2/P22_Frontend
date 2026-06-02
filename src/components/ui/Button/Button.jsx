import './Button.css'

/**
 * @param {object} props
 * @param {'button' | 'submit' | 'reset'} [props.type]
 * @param {'primary' | 'secondary' | 'danger' | 'ghost'} [props.variant]
 * @param {boolean} [props.disabled]
 * @param {() => void} [props.onClick]
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export default function Button({
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
  children,
  className = '',
}) {
  return (
    <button
      type={type}
      className={`edu-btn edu-btn--${variant} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

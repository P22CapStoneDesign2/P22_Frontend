import './MenuCard.css'

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.icon
 * @param {string} props.title
 * @param {() => void} props.onClick
 * @param {string} [props.ariaLabel]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
export default function MenuCard({
  icon,
  title,
  onClick,
  ariaLabel,
  disabled = false,
  className = '',
}) {
  return (
    <button
      type="button"
      className={`edu-menu-card ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? title}
    >
      <span className="edu-menu-card__icon" aria-hidden>
        {icon}
      </span>
      <span className="edu-menu-card__title">{title}</span>
    </button>
  )
}

import { usePageBackNavigation } from '../../../shared/navigation/usePageBackNavigation.js'
import './PageBackButton.css'

/**
 * @param {object} props
 * @param {string} [props.fallbackPath]
 * @param {string} [props.className]
 */
export default function PageBackButton({ fallbackPath, className = '' }) {
  const goBack = usePageBackNavigation(fallbackPath)

  return (
    <button
      type="button"
      className={`edu-page-back ${className}`.trim()}
      onClick={goBack}
    >
      뒤로 가기
    </button>
  )
}

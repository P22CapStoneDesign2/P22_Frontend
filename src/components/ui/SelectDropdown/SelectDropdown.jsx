import { useEffect, useId, useRef } from 'react'
import './SelectDropdown.css'

/**
 * @template T
 * @param {object} props
 * @param {T[]} props.options
 * @param {T | null} [props.selected]
 * @param {string} props.placeholder
 * @param {boolean} props.isOpen
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {(option: T) => void} props.onSelect
 * @param {boolean} [props.disabled]
 * @param {string} [props.emptyMessage]
 * @param {(option: T) => string | number} [props.getOptionValue]
 * @param {(option: T) => string} [props.getOptionLabel]
 * @param {string} [props.className]
 * @param {string} [props.listMaxHeight] CSS length, e.g. '240px'
 */
export default function SelectDropdown({
  options = [],
  selected = null,
  placeholder,
  isOpen,
  onOpenChange,
  onSelect,
  disabled = false,
  emptyMessage = '목록이 없습니다.',
  getOptionValue = (o) => o.value,
  getOptionLabel = (o) => (o.label != null ? String(o.label) : String(getOptionValue(o))),
  className = '',
  listMaxHeight = '240px',
}) {
  const rootRef = useRef(null)
  const listId = useId()

  useEffect(() => {
    if (!isOpen) return
    const onDocMouseDown = (e) => {
      const el = rootRef.current
      const t = e.target
      if (!el || !(t instanceof Node) || el.contains(t)) return
      onOpenChange(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [isOpen, onOpenChange])

  const selVal = selected != null ? getOptionValue(selected) : null
  const triggerLabel =
    selected != null ? getOptionLabel(selected) : placeholder

  const toggle = () => {
    if (disabled) return
    onOpenChange(!isOpen)
  }

  const handleSelect = (opt) => {
    onSelect(opt)
    onOpenChange(false)
  }

  return (
    <div
      ref={rootRef}
      className={`edu-select ${disabled ? 'edu-select--disabled' : ''} ${className}`.trim()}
    >
      <button
        type="button"
        className="edu-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        disabled={disabled}
        onClick={toggle}
      >
        <span className="edu-select__trigger-text">{triggerLabel}</span>
        <span className="edu-select__chevron" aria-hidden>
          ▾
        </span>
      </button>
      {isOpen ? (
        <div
          id={listId}
          className="edu-select__list-wrap"
          role="listbox"
          style={{ maxHeight: listMaxHeight }}
        >
          {options.length === 0 ? (
            <div className="edu-select__empty" role="presentation">
              {emptyMessage}
            </div>
          ) : (
            <ul className="edu-select__list">
              {options.map((opt, i) => {
                const v = getOptionValue(opt)
                const isSelected = selVal != null && v === selVal
                return (
                  <li key={`${String(v)}-${i}`} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`edu-select__option${isSelected ? ' edu-select__option--selected' : ''}`}
                      onClick={() => handleSelect(opt)}
                    >
                      {getOptionLabel(opt)}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}

import styles from './SegmentedControl.module.css'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: string
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  'aria-label': string
}

/**
 * New in M12, for the comparison screen's cheapest/fastest/recipient-
 * amount sort toggle — no existing Button variant fit a multi-option
 * toggle group. `role="radiogroup"` since exactly one option is always
 * selected, same semantics as a radio button set.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div className={styles.group} role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`ds-text-label ${styles.segment} ${isActive ? styles.segmentActive : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

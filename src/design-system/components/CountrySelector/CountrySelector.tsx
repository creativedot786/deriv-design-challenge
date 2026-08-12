import { useId } from 'react'
import styles from './CountrySelector.module.css'

export interface CountrySelectorOption {
  id: string
  countryName: string
  currencyCode: string
  flag: string
}

export interface CountrySelectorProps {
  label: string
  options: CountrySelectorOption[]
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

/**
 * New in M12. Didn't exist in any form before the aggregator expansion
 * — the previous single-currency scope never needed to represent a
 * country. A native <select> rather than a custom listbox: flag emoji
 * render fine in native options, and it comes with keyboard/a11y
 * behavior for free instead of reimplementing a popover.
 */
export function CountrySelector({ label, options, value, onChange, disabled }: CountrySelectorProps) {
  const id = useId()
  const selected = options.find((o) => o.id === value)

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={`ds-text-label ${styles.label}`}>
        {label}
      </label>
      <div className={styles.wrap}>
        {selected && <span className={styles.flag} aria-hidden="true">{selected.flag}</span>}
        <select
          id={id}
          className={`${styles.select} ds-text-body-lg`}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.countryName} · {o.currencyCode}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true">
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  )
}

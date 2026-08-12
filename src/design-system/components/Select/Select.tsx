import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string
  options: SelectOption[]
  /** Shown as a disabled first option when nothing's chosen yet — distinct from a real option so it can't be silently re-selected. */
  placeholder?: string
  helperText?: string
  errorText?: string
}

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

/**
 * M25 — generic labeled dropdown, split out of CountrySelector (which
 * stays flag-specific) for the Add Beneficiary form's bank field. A
 * native <select> for the same reason CountrySelector picked one:
 * keyboard/a11y behavior for free instead of a custom listbox.
 */
export function Select({ label, options, placeholder, helperText, errorText, disabled, className, value, ...rest }: SelectProps) {
  const id = useId()
  const isError = Boolean(errorText)
  const message = errorText ?? helperText
  const helperId = message ? `${id}-helper` : undefined

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={`ds-text-label ${styles.label}`}>
        {label}
      </label>
      <div className={styles.wrap}>
        <select
          id={id}
          className={[styles.select, isError ? styles.error : '', 'ds-text-body-lg', className].filter(Boolean).join(' ')}
          disabled={disabled}
          aria-invalid={isError || undefined}
          aria-describedby={helperId}
          value={value}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true">
          <ChevronDownIcon />
        </span>
      </div>
      {message && (
        <span id={helperId} className={`ds-text-caption ${styles.helper} ${isError ? styles.helperError : ''}`}>
          {message}
        </span>
      )}
    </div>
  )
}

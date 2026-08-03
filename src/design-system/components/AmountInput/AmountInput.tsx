import type { ChangeEvent, InputHTMLAttributes } from 'react'
import styles from './AmountInput.module.css'

export interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  helperText?: string
  /** Presence of an error message puts the field into its error state (red value + message). */
  errorText?: string
}

/** Strips everything except digits and a single decimal point. */
function sanitizeAmount(raw: string): string {
  const digitsAndDots = raw.replace(/[^0-9.]/g, '')
  const firstDot = digitsAndDots.indexOf('.')
  if (firstDot === -1) return digitsAndDots
  return (
    digitsAndDots.slice(0, firstDot + 1) + digitsAndDots.slice(firstDot + 1).replace(/\./g, '')
  )
}

export function AmountInput({ helperText, errorText, onChange, ...rest }: AmountInputProps) {
  const isError = Boolean(errorText)
  const message = errorText ?? helperText

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeAmount(event.target.value)
    if (sanitized !== event.target.value) {
      event.target.value = sanitized
    }
    onChange?.(event)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <span className={`ds-text-display ${styles.currency}`}>$</span>
        <input
          className={`${styles.input} ds-text-display-xl ${isError ? styles.inputError : ''}`}
          inputMode="decimal"
          pattern="[0-9]*\.?[0-9]*"
          aria-label="Amount to send"
          aria-invalid={isError || undefined}
          onChange={handleChange}
          {...rest}
        />
      </div>
      {message && (
        <span className={`ds-text-caption ${styles.helper} ${isError ? styles.helperError : ''}`}>
          {message}
        </span>
      )}
    </div>
  )
}
